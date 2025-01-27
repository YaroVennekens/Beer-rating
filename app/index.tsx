import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '@/app/screens/HomeScreen';
import CreateRatingScreen from '@/app/screens/review/CreateRatingScreen';
import OverviewScreen from '@/app/screens/OverviewScreen';
import MapScreen from '@/app/screens/MapScreen';
import ReviewsScreen from '@/app/screens/review/ReviewsScreen';
import ReviewDetailScreen from '@/app/screens/review/ReviewDetailScreen';
import LoginScreen from '@/app/screens/user/LoginScreen';
import RegisterScreen from '@/app/screens/user/RegisterScreen';
import AcceptFriendRequestScreen from '@/app/screens/friends/AcceptFriendRequest';
import FriendsScreen from '@/app/screens/friends/FriendsScreen';
import AddFriendScreen from '@/app/screens/friends/AddFriendScreen';
import FriendListScreen from '@/app/screens/friends/FriendListScreen';
import FriendReviewsScreen from '@/app/screens/friends/FriendReviewsScreen';
import ProfileScreen from '@/app/screens/user/ProfileScreen';
import FriendProfileScreen from '@/app/screens/friends/FriendProfileScreen';
import { Rating } from '@/app/interrface/ReviewInterface';
import GameSetupScreen from '@/app/screens/minigame/mrwhite/GameSetup'
import PlayGameScreen from '@/app/screens/minigame/mrwhite/PlayGameScreen'

// Create a stack navigator
const Stack = createStackNavigator();

// Define the RootStackParamList for proper typing of navigation
export type RootStackParamList = {
  Home: undefined;
  CreateRating: undefined;
  Overview: undefined;
  Maps: undefined;
  Reviews: undefined;
  ReviewDetail: { rating: Rating; friendId: string; avatarColor: string }; // parameters for ReviewDetailScreen
  Login: undefined;
  Register: undefined;
  Friends: undefined;
  AddFriend: undefined;
  FriendsList: undefined;
  AcceptFriendRequest: undefined;
  FriendReviews: undefined;
  Profile: undefined;
  FriendProfile: undefined;
};

// Main navigation component
export default function Index() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: true,
      }}
    >
      {/* Home Screen */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Recente beoordelingen' }}
      />

      {/* Create New Review */}
      <Stack.Screen
        name="CreateRating"
        component={CreateRatingScreen}
        options={{ title: 'Maak een review aan' }}
      />

      {/* Overview of All Reviews */}
      <Stack.Screen
        name="Overview"
        component={OverviewScreen}
        options={{ title: 'Alle reviews' }}
      />

      {/* Map Screen */}
      <Stack.Screen
        name="Maps"
        component={MapScreen}
        options={{ title: 'Map' }}
      />

      {/* Reviews Screen */}
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ title: 'Reviews' }}
      />

      {/* Review Detail Screen */}
      <Stack.Screen
        name="ReviewDetail"
        component={ReviewDetailScreen}
        options={{ title: 'Review Details' }}
      />

      {/* Login Screen */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      {/* Register Screen */}
      <Stack.Screen
        name="Register"
        options={{ title: 'Registreer' }}
        component={RegisterScreen}
      />

      {/* Friends Screen */}
      <Stack.Screen
        name="Friends"
        component={FriendsScreen}
      />

      <Stack.Screen
        name="GameSetup"
        component={GameSetupScreen}
      />

      <Stack.Screen
        name="PlayGame"
        component={PlayGameScreen}
      />

      {/* Add Friend Screen */}
      <Stack.Screen
        name="AddFriend"
        options={{ title: 'Vrienden toevoegen' }}
        component={AddFriendScreen}
      />

      {/* Friends List Screen */}
      <Stack.Screen
        name="FriendsList"
        options={{ title: 'Vrienden lijst' }}
        component={FriendListScreen}
      />

      {/* Accept Friend Request Screen */}
      <Stack.Screen
        name="AcceptFriendRequest"
        options={{ title: 'Vrienden accepteren' }}
        component={AcceptFriendRequestScreen}
      />

      {/* Friend Reviews Screen */}
      <Stack.Screen
        name="FriendReviews"
        options={{ title: 'Online' }}
        component={FriendReviewsScreen}
      />

      {/* User Profile Screen */}
      <Stack.Screen
        name="Profile"
        options={{ title: 'Profiel' }}
        component={ProfileScreen}
      />

      {/* Friend's Profile Screen */}
      <Stack.Screen
        name="FriendProfile"
        component={FriendProfileScreen}
      />
    </Stack.Navigator>
  );
}