
import { Partition } from '@/lib/mockData';
import PartitionCard from './PartitionCard';

interface PartitionGridProps {
  partitions: Partition[];
  showStatus?: boolean;
}

const PartitionGrid = ({ partitions, showStatus = true }: PartitionGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {partitions.map((partition) => (
        <PartitionCard 
          key={partition.id}
          partition={partition}
          showStatus={showStatus}
        />
      ))}
    </div>
  );
};

export default PartitionGrid;
