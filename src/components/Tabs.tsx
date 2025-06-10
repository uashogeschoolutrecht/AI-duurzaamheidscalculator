// SPDX-License-Identifier: EUPL-1.2
// Copyright (C) 2025 Saddik Khaddamellah
// Met dank aan Erik Slingerland voor begeleiding.
import React from 'react';

// Props voor het Tabs-component: huidige waarde, handler voor waarde-wijziging en children
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

// Props voor de lijst van tab-triggers
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

// Props voor een enkele tab-trigger (tab-knop)
interface TabsTriggerProps {
  value: string;
  currentValue: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  completed?: boolean; // geeft aan of deze stap afgerond is
}

// Props voor de content van een tab
interface TabsContentProps {
  value: string;
  currentValue: string;
  children: React.ReactNode;
}

// Tabs-component: beheert welke tab actief is en geeft children door met extra props
export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  return (
    <div className="w-full">
      {React.Children.map(children, (child) => {
        // Alleen children met een 'value'-prop worden als tab herkend
        if (
          React.isValidElement(child) &&
          typeof child.props.value === 'string'
        ) {
          const childWithProps = child as React.ReactElement<
            TabsTriggerProps | TabsContentProps
          >;

          // Geeft currentValue en onClick door aan elk child
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

// TabsList: container voor de tab-triggers (knoppen)
export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

// TabsTrigger: een enkele tab-knop, met styling voor actief/completed/default
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

// TabsContent: toont alleen de content als deze tab actief is
export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  currentValue,
  children,
}) => {
  if (value !== currentValue) return null;

  return <div className="mt-4">{children}</div>;
};
