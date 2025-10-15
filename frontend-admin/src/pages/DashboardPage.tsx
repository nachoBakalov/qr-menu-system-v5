import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientService, menuService } from '../services';

const DashboardPage: React.FC = () => {
  // Fetch dashboard stats
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients', 1, 100],
    queryFn: () => clientService.getClients(1, 100),
  });

  const { data: menusData, isLoading: menusLoading } = useQuery({
    queryKey: ['menus', 1, 100],
    queryFn: () => menuService.getMenus(1, 100),
  });

  const stats = [
    {
      name: 'Общо клиенти',
      value: clientsData?.pagination?.total || 0,
      icon: '🏢',
      color: 'bg-blue-600',
      loading: clientsLoading,
    },
    {
      name: 'Общо менюта',
      value: menusData?.pagination?.total || 0,
      icon: '📋',
      color: 'bg-green-600',
      loading: menusLoading,
    },
    {
      name: 'Активни менюта',
      value: menusData?.data?.filter(menu => menu.active)?.length || 0,
      icon: '✅',
      color: 'bg-yellow-600',
      loading: menusLoading,
    },
    {
      name: 'Публикувани',
      value: menusData?.data?.filter(menu => menu.published)?.length || 0,
      icon: '🌐',
      color: 'bg-purple-600',
      loading: menusLoading,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Преглед на системата за QR менюта
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${item.color} rounded-md p-3`}>
                    <span className="text-white text-xl">{item.icon}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd>
                      {item.loading ? (
                        <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
                      ) : (
                        <div className="text-lg font-medium text-gray-900">
                          {item.value}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Последни клиенти
            </h3>
            <div className="mt-6 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {clientsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  clientsData?.data?.slice(0, 5).map((client) => (
                    <li key={client.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {client.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {client.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {client.slug}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.active ? 'Активен' : 'Неактивен'}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
            {!clientsLoading && clientsData?.data && clientsData.data.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">Няма клиенти</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;