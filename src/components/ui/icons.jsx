import { 
  FileText, 
  PlayCircle, 
  History, 
  BarChart3, 
  ArrowLeft, 
  User,
  LogOut,
  Trophy,
  Star
} from 'lucide-react';

export const IconFileText = ({ className, ...props }) => (
  <FileText className={className} {...props} />
);

export const IconPlayCircle = ({ className, ...props }) => (
  <PlayCircle className={className} {...props} />
);

export const IconHistory = ({ className, ...props }) => (
  <History className={className} {...props} />
);

export const IconBarChart = ({ className, ...props }) => (
  <BarChart3 className={className} {...props} />
);

export const IconArrowLeft = ({ className, ...props }) => (
  <ArrowLeft className={className} {...props} />
);

export const IconUser = ({ className, ...props }) => (
  <User className={className} {...props} />
);

export const IconLogout = ({ className, ...props }) => (
  <LogOut className={className} {...props} />
);

export const IconTrophy = ({ className, ...props }) => (
  <Trophy className={className} {...props} />
);

export const IconStar = ({ className, ...props }) => (
  <Star className={className} {...props} />
); 