import { LayoutDashboard, ListTodo, CalendarDays, History } from 'lucide-react';
import React from 'react';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export const navItems: NavItem[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: React.createElement(LayoutDashboard, { size: 18 }) },
  { href: '/goals',     label: '目標管理',       icon: React.createElement(ListTodo, { size: 18 }) },
  { href: '/calendar',  label: 'カレンダー',     icon: React.createElement(CalendarDays, { size: 18 }) },
  { href: '/history',   label: '履歴・分析',     icon: React.createElement(History, { size: 18 }) },
];
