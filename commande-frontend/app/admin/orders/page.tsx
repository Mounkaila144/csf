'use client';

import React from 'react';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import OrdersPage from '../../../src/components/admin/OrdersPage';

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <OrdersPage />
    </AdminLayout>
  );
}