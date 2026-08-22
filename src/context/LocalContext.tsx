import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDynamicCityUpdate } from '../utils/newsFetcher';
import { CityLiveUpdate } from '../data/cityLiveUpdates';

interface LocalContextType {
  cityCode: string;
  cityName: string;
  update: CityLiveUpdate;
  lastUpdatedTime: string;
  isRefreshing: boolean;
  refreshLocalContext: () => void;
}

const LocalContext = createContext<LocalContextType | undefined>(undefined);

interface LocalProviderProps {
  cityCode: string;
  cityName: string;
  children: ReactNode;
}

export const LocalProvider: React.FC<LocalProviderProps> = ({
  cityCode,
  cityName,
  children
}) => {
  const [update, setUpdate] = useState<CityLiveUpdate>(() => getDynamicCityUpdate(cityCode));
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshLocalContext = () => {
    setIsRefreshing(true);
    const newUpdate = getDynamicCityUpdate(cityCode);
    setUpdate(newUpdate);
    setLastUpdatedTime(new Date().toLocaleTimeString());
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    refreshLocalContext();

    // Dynamically update real-time weather, news, and traffic every hour (3,600,000 ms)
    const timer = setInterval(() => {
      refreshLocalContext();
    }, 3600000);

    return () => clearInterval(timer);
  }, [cityCode]);

  return (
    <LocalContext.Provider
      value={{
        cityCode,
        cityName,
        update,
        lastUpdatedTime,
        isRefreshing,
        refreshLocalContext
      }}
    >
      {children}
    </LocalContext.Provider>
  );
};

export const useLocalContext = (): LocalContextType => {
  const context = useContext(LocalContext);
  if (!context) {
    throw new Error('useLocalContext must be used within a LocalProvider');
  }
  return context;
};
