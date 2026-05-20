import { BoardColumn } from '../../models/BoardColumn';
import { DashboardSummary } from '../../models/DashboardSummary';
import { FilterState } from '../../models/FilterState';
import { Ticket, TicketStatus } from '../../models/Ticket';

export const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'INC-10421',
    subject: 'VPN access failing for finance users',
    department: 'Finance',
    assignedTo: { id: 'u1', displayName: 'Asha Pillay', email: 'asha.pillay@example.com', department: 'IT Ops' },
    status: 'Open',
    priority: 'High',
    category: 'Network',
    createdAt: '2026-05-17T08:15:00Z',
    updatedAt: '2026-05-20T09:30:00Z',
    timeSpent: 125
  },
  {
    id: '2',
    ticketNumber: 'INC-10422',
    subject: 'New starter device provisioning',
    department: 'People',
    assignedTo: { id: 'u2', displayName: 'Daniel Mokoena', email: 'daniel.mokoena@example.com', department: 'Service Desk' },
    status: 'Pending',
    priority: 'Medium',
    category: 'Hardware',
    createdAt: '2026-05-18T10:05:00Z',
    updatedAt: '2026-05-20T07:45:00Z',
    timeSpent: 60
  },
  {
    id: '3',
    ticketNumber: 'INC-10423',
    subject: 'Payroll integration timeout',
    department: 'Finance',
    assignedTo: { id: 'u3', displayName: 'Mia Jacobs', email: 'mia.jacobs@example.com', department: 'Platform' },
    status: 'Escalated',
    priority: 'Critical',
    category: 'Integration',
    createdAt: '2026-05-16T13:20:00Z',
    updatedAt: '2026-05-20T11:10:00Z',
    timeSpent: 310
  },
  {
    id: '4',
    ticketNumber: 'INC-10424',
    subject: 'Shared mailbox permissions updated',
    department: 'Sales',
    assignedTo: { id: 'u4', displayName: 'Lebo Khumalo', email: 'lebo.khumalo@example.com', department: 'Messaging' },
    status: 'Closed',
    priority: 'Low',
    category: 'Microsoft 365',
    createdAt: '2026-05-14T09:00:00Z',
    updatedAt: '2026-05-19T15:35:00Z',
    timeSpent: 35
  }
];

export const mockDashboardSummary: DashboardSummary = {
  open: 42,
  closed: 318,
  pending: 17,
  escalated: 6,
  total: 383
};

const boardStatuses: TicketStatus[] = ['Open', 'Pending', 'Escalated', 'Closed'];

export const mockBoardColumns: BoardColumn[] = boardStatuses.map((status) => ({
  id: status,
  title: status,
  tickets: mockTickets.filter((ticket) => ticket.status === status)
}));

export const mockFilters: FilterState[] = [
  {
    id: 'f1',
    name: 'Critical finance incidents',
    owner: 'Operations Admin',
    statuses: ['Open', 'Escalated'],
    priorities: ['High', 'Critical'],
    departments: ['Finance'],
    isShared: true
  },
  {
    id: 'f2',
    name: 'Pending service desk queue',
    owner: 'Service Desk',
    statuses: ['Pending'],
    priorities: ['Low', 'Medium', 'High'],
    departments: ['People', 'Sales', 'Finance'],
    isShared: false
  }
];
