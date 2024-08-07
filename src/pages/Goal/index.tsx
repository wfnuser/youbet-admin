import {
  ActionType,
  PageContainer,
  ProDescriptions,
  ProDescriptionsItemProps,
  ProTable,
} from '@ant-design/pro-components';
import { Drawer } from 'antd';
import React, { useRef, useState } from 'react';
import { GoalInfo, NetworkType, SDK } from 'youbet-sdk';

const sdk = new SDK({
  networkType: NetworkType.Testnet, // or NetworkType.Testnet
});

const TableList: React.FC<unknown> = () => {
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<GoalInfo>();
  const [data, setData] = useState<GoalInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchGoals = async ({
    params,
  }: {
    params: Record<string, string | number>;
  }) => {
    setLoading(true);
    try {
      const goals = await sdk.client.getAllGoals();
      const filteredGoals = goals.filter((goal) => {
        if (!params) {
          return true;
        }

        if ('goalType' in params && goal.goalType !== params.goalType) {
          return false;
        }
        if ('name' in params && !goal.name.includes(params.name as string)) {
          return false;
        }
        return true;
      });
      setData(filteredGoals);
      return filteredGoals;
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchGoals();
  // }, []);

  const columns: ProDescriptionsItemProps<GoalInfo>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '质押金额',
      dataIndex: 'requiredStake',
      valueType: 'text',
      render: (_, record) => record.requiredStake / 1e18 + 'eth',
      hideInSearch: true,
    },
    {
      title: '参与者人数',
      dataIndex: 'participants',
      valueType: 'text',
      render: (_, record) => record.participants.length,
      hideInSearch: true,
    },
    {
      title: '目标类型',
      dataIndex: 'goalType',
      valueType: 'select',
      valueEnum: new Map([
        [0, { text: '单人模式', status: 'Solo' }],
        [1, { text: '对赌模式', status: 'Gambling' }],
      ]),
    },
  ];

  return (
    <PageContainer header={{ title: '目标列表' }}>
      <ProTable<GoalInfo>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        request={async (params) => {
          // Here you need to return a Promise, and you can transform the data before returning it
          // If you need to transform the parameters you can change them here
          const result = await fetchGoals({ params });
          return {
            data: result,
            // Please return true for success.
            // otherwise the table will stop parsing the data, even if there is data
            success: true,
            // not passed will use the length of the data, if it is paged you must pass
            total: result?.length,
          };
        }}
        loading={loading}
        dataSource={data}
        columns={columns}
        onRow={(record) => ({
          onClick: () => {
            setRow(record);
          },
        })}
      />
      <Drawer
        width={600}
        open={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={false}
      >
        {row?.name && (
          <ProDescriptions<GoalInfo>
            column={2}
            title={row?.name}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.name,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
