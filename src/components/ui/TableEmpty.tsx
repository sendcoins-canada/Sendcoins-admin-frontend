interface TableEmptyProps {
  message?: string;
  action?: React.ReactNode;
}

export function TableEmpty({ message = 'No data found', action }: TableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[256px] py-12 text-gray-500">
      <p className="text-sm">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
