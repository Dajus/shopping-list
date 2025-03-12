// src/app/page.tsx
import ShoppingList from '@/components/ShoppingList';

export default function Home() {
  return (
      <div
          style={{
              minHeight: '100vh',
              width: '100%',
              // Hero Patterns od Steve Schoger - "Polka Dots"
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: '#f5f7fa',
              padding: '20px',
          }}
      >
          <ShoppingList />
      </div>
  );
}