import { Camera } from 'lucide-react';
import { Profile } from '@/types/database';

interface UserInfoCardProps {
    profile: Profile | null;
    size?: 'sm' | 'md' | 'lg';
}

export function UserInfoCard({ profile, size = 'md' }: UserInfoCardProps) {
    const sizes = {
        sm: { photo: 'w-12 h-12', text: 'text-sm', uidText: 'text-xs' },
        md: { photo: 'w-16 h-16', text: 'text-base', uidText: 'text-sm' },
        lg: { photo: 'w-24 h-24', text: 'text-lg', uidText: 'text-base' }
    };

    const { photo, text, uidText } = sizes[size];

    return (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <div className={`${photo} rounded-full overflow-hidden bg-muted flex-shrink-0`}>
                {profile?.photo_url ? (
                    <img
                        src={profile.photo_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800 dark:to-teal-800">
                        <Camera className="w-1/2 h-1/2 text-emerald-600 dark:text-emerald-400" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className={`${text} font-semibold text-foreground truncate`}>
                    {profile?.full_name || 'User'}
                </p>
                <p className={`${uidText} font-mono font-bold text-emerald-600 dark:text-emerald-400`}>
                    UID: {profile?.uid || '----'}
                </p>
            </div>
        </div>
    );
}
