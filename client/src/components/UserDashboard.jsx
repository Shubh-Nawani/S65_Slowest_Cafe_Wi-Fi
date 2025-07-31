import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Heart, Star, MapPin, Clock, Trophy, TrendingUp, 
  Coffee, Wifi, Settings, Edit, Camera, Target, Award,
  Calendar, BarChart3, Activity, Bookmark
} from 'lucide-react';
import { Button, Card, Badge, Input, LoadingSpinner, Modal } from './ui';
import { AuthContext } from '../contexts/AuthContext';
import SpeedTestWidget from './advanced/SpeedTestWidget';
import { ReviewsSection } from './advanced/RatingSystem';

const UserDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [speedTests, setSpeedTests] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  
  const { user, updateUser } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await fetch('/api/v2/users/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.user);
        setProfileForm(profileData.user);
      }

      // Fetch favorites
      const favoritesResponse = await fetch('/api/v2/users/favorites', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        setFavorites(favoritesData.favorites || []);
      }

      // Fetch user reviews
      const reviewsResponse = await fetch('/api/v2/users/reviews', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews || []);
      }

      // Fetch speed tests
      const speedTestsResponse = await fetch('/api/v2/users/speed-tests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (speedTestsResponse.ok) {
        const speedTestsData = await speedTestsResponse.json();
        setSpeedTests(speedTestsData.speedTests || []);
      }

      // Fetch achievements
      const achievementsResponse = await fetch('/api/v2/users/achievements', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        setAchievements(achievementsData.achievements || []);
      }

      // Fetch user stats
      const statsResponse = await fetch('/api/v2/users/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || {});
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/v2/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfile(updatedData.user);
        updateUser(updatedData.user);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const ProfileHeader = () => (
    <Card className="p-6 mb-6">
      <div className="flex items-start gap-6">
        {/* Profile Picture */}
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-coffee-500 to-orange-600 rounded-full flex items-center justify-center">
            {profile?.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          
          {editMode && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute -bottom-2 -right-2 w-8 h-8 p-0 bg-white shadow-md rounded-full"
            >
              <Camera className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          {editMode ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={profileForm.name || ''}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Input
                  label="Location"
                  value={profileForm.location || ''}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                  icon={MapPin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={profileForm.bio || ''}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" variant="coffee">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{profile?.name || user?.name}</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-gray-600 mb-3">
                {profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Joined {new Date(profile?.createdAt || user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {profile?.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}
              
              {/* Quick Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-coffee-600">{favorites.length}</div>
                  <div className="text-xs text-gray-500">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-coffee-600">{reviews.length}</div>
                  <div className="text-xs text-gray-500">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-coffee-600">{achievements.length}</div>
                  <div className="text-xs text-gray-500">Achievements</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  const TabNavigation = () => {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { id: 'favorites', label: 'Favorites', icon: Heart },
      { id: 'reviews', label: 'Reviews', icon: Star },
      { id: 'achievements', label: 'Achievements', icon: Trophy },
      { id: 'activity', label: 'Activity', icon: Activity },
    ];

    return (
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-coffee-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  const OverviewTab = () => (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Activity Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-coffee-600" />
          Recent Activity
        </h3>
        
        <div className="space-y-4">
          {reviews.slice(0, 3).map((review) => (
            <div key={review._id} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Reviewed <span className="font-medium">{review.cafeId.name}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          
          {speedTests.slice(0, 2).map((test) => (
            <div key={test._id} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Wifi className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Speed test at <span className="font-medium">{test.cafeId.name}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {test.download}↓ / {test.upload}↑ Mbps
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-coffee-600" />
          Your Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-coffee-50 rounded-lg">
            <div className="text-2xl font-bold text-coffee-600">
              {stats.totalVisits || 0}
            </div>
            <div className="text-sm text-coffee-700">Café Visits</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.avgRating || 0}
            </div>
            <div className="text-sm text-blue-700">Avg Rating Given</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalReviews || reviews.length}
            </div>
            <div className="text-sm text-green-700">Reviews Written</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.streakDays || 0}
            </div>
            <div className="text-sm text-purple-700">Day Streak</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const FavoritesTab = () => (
    <div className="space-y-6">
      {favorites.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600">Start exploring cafés and save your favorites!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((cafe) => (
            <Card key={cafe._id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{cafe.name}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {cafe.address}
                  </p>
                </div>
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </div>
              
              {cafe.wifiSpeed && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wifi className="w-4 h-4" />
                  <span>{cafe.wifiSpeed.download} Mbps</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const ReviewsTab = () => (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">Share your café experiences with the community!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{review.cafeId.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700">{review.comment}</p>
              
              {review.categories && (
                <div className="flex gap-4 mt-3 pt-3 border-t">
                  {Object.entries(review.categories).map(([category, rating]) => (
                    rating > 0 && (
                      <div key={category} className="flex items-center gap-1">
                        <span className="text-xs text-gray-600 capitalize">{category}:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const AchievementsTab = () => (
    <div className="space-y-6">
      {achievements.length === 0 ? (
        <Card className="p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
          <p className="text-gray-600">Keep exploring and reviewing to unlock achievements!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card key={achievement._id} className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">{achievement.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
              
              <Badge variant="success" size="sm">
                Earned {new Date(achievement.earnedAt).toLocaleDateString()}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const ActivityTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Speed Test History</h3>
        
        {speedTests.length === 0 ? (
          <div className="text-center py-8">
            <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No speed tests recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {speedTests.slice(0, 10).map((test) => (
              <div key={test._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{test.cafeId.name}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {test.download}↓ / {test.upload}↑ Mbps
                  </div>
                  <div className="text-sm text-gray-600">
                    {test.ping}ms ping
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ProfileHeader />
        <TabNavigation />
        
        <div className="min-h-[400px]">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'favorites' && <FavoritesTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'achievements' && <AchievementsTab />}
          {activeTab === 'activity' && <ActivityTab />}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
