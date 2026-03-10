import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import { Card } from '@/components/ui/card';
import { Calendar, CheckCircle, Clock, AlertTriangle, Bell, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardShell from '@/components/DashboardShell';
import { fieldManagerMenuItems } from '@/config/dashboardMenus';

export default function TodayTasks() {
    const { user } = useAuth();
    const today = new Date().toISOString().split('T')[0];

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['today-tasks', user?.id, today],
        queryFn: async () => {
            const response = await javaApi.select('tasks', {
                eq: { assigned_to: user?.id },
                order: { field: 'created_at', ascending: false }
            });
            const allTasks = response.success && response.data ? response.data as any[] : [];

            // Filter for today's tasks or pending tasks
            return allTasks.filter((t: any) => {
                const dueDate = t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : '';
                return dueDate === today || t.status === 'pending' || t.status === 'in_progress';
            });
        },
        enabled: !!user?.id,
    });

    const pendingTasks = tasks.filter((t: any) => t.status === 'pending');
    const inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress');
    const completedToday = tasks.filter((t: any) => t.status === 'completed');

    return (
        <DashboardShell menuItems={fieldManagerMenuItems} role="Field Manager">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Today's Tasks</h1>
                    <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="text-3xl font-bold text-amber-600">{pendingTasks.length}</p>
                            </div>
                            <Clock className="w-10 h-10 text-amber-600 opacity-30" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                                <p className="text-3xl font-bold text-blue-600">{inProgressTasks.length}</p>
                            </div>
                            <AlertTriangle className="w-10 h-10 text-blue-600 opacity-30" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-3xl font-bold text-green-600">{completedToday.length}</p>
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-600 opacity-30" />
                        </div>
                    </Card>
                </div>

                {isLoading ? (
                    <Card className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></Card>
                ) : tasks.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No tasks scheduled for today</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {pendingTasks.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-3"><Bell className="inline-block w-5 h-5 mr-1 align-middle" /> Pending Tasks</h2>
                                {pendingTasks.map((task: any) => (
                                    <Card key={task.id} className="p-4 mb-3 border-l-4 border-l-amber-500">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground">{task.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-900">
                                                        {task.status}
                                                    </span>
                                                    {task.priority && (
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-900' :
                                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-900' :
                                                                'bg-gray-100 text-gray-900'
                                                            }`}>
                                                            {task.priority} priority
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button size="sm">Start Task</Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {inProgressTasks.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-3"><Zap className="inline-block w-5 h-5 mr-1 align-middle" /> In Progress</h2>
                                {inProgressTasks.map((task: any) => (
                                    <Card key={task.id} className="p-4 mb-3 border-l-4 border-l-blue-500">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground">{task.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-900 inline-block mt-2">
                                                    {task.status}
                                                </span>
                                            </div>
                                            <Button size="sm" variant="outline">Complete</Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {completedToday.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-3"><CheckCircle className="inline-block w-5 h-5 mr-1 align-middle" /> Completed Today</h2>
                                {completedToday.map((task: any) => (
                                    <Card key={task.id} className="p-4 mb-3 border-l-4 border-l-green-500 opacity-70">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground">{task.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-900 inline-block mt-2">
                                                    completed
                                                </span>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
