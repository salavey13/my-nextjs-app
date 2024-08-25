//components/SupabaseManager.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SupabaseManager: React.FC = () => {
  const [status, setStatus] = useState('');

  const handleExecuteSQL = async () => {
    try {
      setStatus('Executing SQL...');
      // Implement the logic to execute SQL and create policies in Supabase
      await supabase.rpc('execute_sql', "NEWSQL");
      await createAnonPolicy();
      setStatus('SQL executed and policies created successfully!');
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  const createAnonPolicy = async () => {
    const tableNames = extractTableNames("NEWSQL");
    for (const table of tableNames) {
      await supabase
        .from(table)
        .select('*')
        .eq('user', 'anon')
        .then(() =>
          supabase
            .from(table)
            .update({ policy: 'true' })
            .eq('user', 'anon')
        );
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold">Supabase Manager</h2>
      <button 
        onClick={handleExecuteSQL} 
        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
      >
        Execute SQL and Create Policies
      </button>
      {status && <p className="mt-2 text-gray-700">{status}</p>}
    </div>
  );
};

// Helper function to extract table names from the SQL statement
const extractTableNames = (sql: string): string[] => {
  const matches = sql.match(/CREATE TABLE (\w+)/g);
  if (matches) {
    return matches.map((match) => match.replace('CREATE TABLE ', ''));
  }
  return [];
};

export default SupabaseManager;