import { useState, useEffect } from "react";
import { Trophy, Lock, CheckCircle, Clock, Star, Zap, Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ItemsService, UserAchievement } from "@/lib/api";


interface AchievementsProps {
  userId?: string;
}

const Achievements = ({ userId }: AchievementsProps) => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (userId) {
      fetchAchievements();
    }
  }, [userId]);

  const fetchAchievements = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const mockAchievements = (await ItemsService.getUserAchievements(userId)).achievements;

      setAchievements(mockAchievements);
    } catch (err) {
      setError("Failed to load achievements");
      console.error("Error fetching achievements:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "story_creation":
        return <Target className="h-4 w-4" />;
      case "creativity":
        return <Star className="h-4 w-4" />;
      case "consistency":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "locked":
        return <Lock className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (achievement: UserAchievement) => {
    if (achievement.state === "completed") return 100;
    return Math.min((achievement.currentValue / achievement.targetValue) * 100, 100);
  };

  const filteredAchievements = activeTab === "all" 
    ? achievements 
    : achievements.filter(a => a.category === activeTab);

  const completedCount = achievements.filter(a => a.state === "completed").length;
  const totalPoints = achievements
    .filter(a => a.state === "completed")
    .reduce((sum, a) => sum + (a.reward?.points || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{completedCount}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{achievements.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Points</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="story_creation">Stories</TabsTrigger>
          <TabsTrigger value="creativity">Creative</TabsTrigger>
          <TabsTrigger value="consistency">Habits</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredAchievements.map((achievement) => (
                <Card key={achievement.achievementId} className={`
                  transition-all duration-200 hover:shadow-md
                  ${achievement.state === "completed" ? "border-green-200 bg-green-50/30" : ""}
                  ${achievement.state === "locked" ? "opacity-60" : ""}
                `}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Achievement Icon/Badge */}
                      <div className={`
                        flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                        ${achievement.state === "completed" ? "bg-green-100" : 
                          achievement.state === "in_progress" ? "bg-blue-100" : "bg-gray-100"}
                      `}>
                        {achievement.state === "completed" ? 
                          <Trophy className="h-6 w-6 text-green-600" /> :
                          getCategoryIcon(achievement.category)
                        }
                      </div>

                      {/* Achievement Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{achievement.title}</h3>
                          {getStateIcon(achievement.state)}
                          {achievement.state === "completed" && (
                            <Badge variant="secondary" className="text-xs">
                              Completed
                            </Badge>
                          )}
                          {achievement.state === "locked" && (
                            <Badge variant="outline" className="text-xs">
                              Locked
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {achievement.description}
                        </p>

                        {/* Progress Bar for Progress/Milestone Types */}
                        {(achievement.type === "progress" || achievement.type === "milestone") && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>
                                {achievement.currentValue} / {achievement.targetValue} {achievement.unit}
                              </span>
                              <span>{Math.round(getProgressPercentage(achievement))}%</span>
                            </div>
                            <Progress 
                              value={getProgressPercentage(achievement)} 
                              className="h-2"
                            />
                          </div>
                        )}

                        {/* Rewards */}
                        {achievement.reward && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {achievement.reward.points && (
                              <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {achievement.reward.points} points
                              </div>
                            )}
                            {achievement.reward.badge && (
                              <div className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {achievement.reward.badge}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Unlock Condition */}
                        {achievement.unlockCondition && achievement.state === "locked" && (
                          <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                            🔒 {achievement.unlockCondition}
                          </div>
                        )}

                        {/* Completion Date */}
                        {achievement.completedAt && (
                          <div className="mt-2 text-xs text-green-600">
                            ✅ Completed on {new Date(achievement.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Achievements;