
import { Partition } from '@/lib/mockData';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface PartitionCardProps {
  partition: Partition;
  showStatus?: boolean;
}

const PartitionCard = ({ partition, showStatus = true }: PartitionCardProps) => {
  const { id, name, size, location, imageUrl, status, price } = partition;
  
  return (
    <Link to={`/partitions/${id}`}>
      <Card className="overflow-hidden glass-morphism card-highlight">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-48 object-cover"
          />
          {showStatus && (
            <div className="absolute top-2 right-2">
              <Badge className={status === 'available' 
                ? 'bg-partition-available text-black' 
                : 'bg-partition-occupied'
              }>
                {status}
              </Badge>
            </div>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        </CardHeader>
        
        <CardContent className="pb-2">
          <p className="text-sm text-gray-400 mb-1">{location}</p>
          <p className="text-sm mb-2">
            Size: {size.area} {size.unit} ({size.width}m × {size.length}m)
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-white/10 pt-3">
          <p className="text-lg font-semibold text-partition-highlight">
            ${price}<span className="text-sm text-gray-400">/month</span>
          </p>
          <Badge variant="outline" className="border-partition-accent text-partition-accent">
            View Details
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default PartitionCard;
