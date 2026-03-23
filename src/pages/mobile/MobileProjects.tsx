import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import MobileLayout from '../../layouts/MobileLayout';
import MobileProjectCard from '../../components/mobile/MobileProjectCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../contexts/AuthContext';

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  next_milestone?: string;
}

export default function MobileProjects() {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, [currentOrganization]);

  const loadProjects = async () => {
    setLoading(true);

    // Mock data for demonstration
    setTimeout(() => {
      setProjects([
        {
          id: '1',
          name: 'E-commerce Platform',
          status: 'active',
          progress: 65,
          next_milestone: 'Payment Integration',
        },
        {
          id: '2',
          name: 'Mobile App Development',
          status: 'active',
          progress: 40,
          next_milestone: 'User Testing',
        },
        {
          id: '3',
          name: 'CRM System',
          status: 'planning',
          progress: 15,
          next_milestone: 'Requirements Review',
        },
        {
          id: '4',
          name: 'Website Redesign',
          status: 'completed',
          progress: 100,
        },
        {
          id: '5',
          name: 'Data Migration',
          status: 'active',
          progress: 80,
          next_milestone: 'Final Testing',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileLayout title="Projects">
      <div className="flex flex-col h-full">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              title="No projects found"
              description="Start your first project to get going"
            />
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MobileProjectCard
                    {...project}
                    onClick={() => navigate(`/app/mobile/projects/${project.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/app/projects/new')}
          className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-40"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>
    </MobileLayout>
  );
}
