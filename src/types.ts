import { LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  inventoryName: string;
  itemName: string;
  weightPerItem: number;
  quantity: number;
  totalWeight: number;
  dateAdded: string;
  price: number;
}

export interface InventoryHistory {
  id: string;
  productId: string;
  productName: string;
  previousQuantity: number;
  newQuantity: number;
  actionType: 'increase' | 'decrease' | 'sale';
  updatedBy: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Staff';
  status: 'Active' | 'Inactive';
}

export interface SaleItem {
  productId: string;
  itemName: string;
  quantity: number;
  weight: number;
  price: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  billNumber: string;
  date: string;
  customerName: string;
  items: SaleItem[];
  totalQuantity: number;
  totalWeight: number;
  grandTotal: number;
}

export interface NavItem {
  label: string;
  icon: LucideIcon;
  id: string;
}
