import React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  currentValue: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  completed?: boolean; // ✅ toegevoegd
}

interface TabsContentProps {
  value: string;
  currentValue: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  return (
    <div className="w-full">
      {React.Children.map(children, (child) => {
        if (
          React.isValidElement(child) &&
          typeof child.props.value === 'string'
        ) {
          const childWithProps = child as React.ReactElement<
            TabsTriggerProps | TabsContentProps
          >;

          return React.cloneElement(childWithProps, {
            currentValue: value,
            onClick: () => onValueChange(childWithProps.props.value),
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  currentValue,
  children,
  className,
  onClick,
  completed,
}) => {
  const isActive = value === currentValue;

  const baseClasses = 'p-4 rounded-lg transition-all duration-200';
  const activeClasses = 'bg-indigo-100 text-indigo-900';
  const completedClasses = 'bg-green-100 text-green-800';
  const defaultClasses = 'bg-white text-gray-600 hover:bg-indigo-50';

  return (
    <button
      onClick={() => onClick?.()}
      className={`${className} ${baseClasses} ${
        isActive ? activeClasses : completed ? completedClasses : defaultClasses
      }`}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  currentValue,
  children,
}) => {
  if (value !== currentValue) return null;

  return <div className="mt-4">{children}</div>;
};
