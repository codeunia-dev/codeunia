import { TestManager } from '@/components/admin/TestManager';

export default function AdminTestPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Test Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage coding tests, questions, and results
        </p>
      </div>
      
      <TestManager />
    </div>
  );
}
