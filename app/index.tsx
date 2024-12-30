import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '@/app/screens/HomeScreen';
import CreateRatingScreen from '@/app/screens/CreateRatingScreen';
import OverviewScreen from '@/app/screens/OverviewScreen';
import MapScreen from '@/app/screens/MapScreen';
import ReviewsScreen from '@/app/screens/ReviewsScreen';
import ReviewDetailScreen from '@/app/screens/ReviewDetailScreen';
import LoginScreen from '@/app/screens/user/LoginScreen';
import RegisterScreen from '@/app/screens/user/RegisterScreen';
import AcceptFriendRequestScreen from '@/app/screens/friends/AcceptFriendRequest'
import FriendsScreen from '@/app/screens/friends/FriendsScreen'
import AddFriendScreen from '@/app/screens/friends/AddFriendScreen'
import FriendListScreen from '@/app/screens/friends/FriendListScreen'
import FriendReviewsScreen from '@/app/screens/friends/FriendReviewsScreen'

const Stack = createStackNavigator();

export default function Index() {
      return (
        <Stack.Navigator initialRouteName="Login">
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Recente beoordelingen' }}
              />
              <Stack.Screen
                name="CreateRating"
                component={CreateRatingScreen}
                options={{ title: 'Maak een review aan' }}
              />
              <Stack.Screen
                name="Overview"
                component={OverviewScreen}
                options={{ title: 'Alle reviews' }}
              />
              <Stack.Screen
                name="Maps"
                component={MapScreen}
                options={{ title: 'Map' }}
              />
              <Stack.Screen
                name="Reviews"
                component={ReviewsScreen}
                options={{ title: 'Reviews' }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
              />
              <Stack.Screen
                name="Friends"
                component={FriendsScreen}
              />

                <Stack.Screen
                  name="AddFriend"
                  options={{ title: 'Vrienden toevoegen' }}
                  component={AddFriendScreen} />
                <Stack.Screen
                  name="FriendsList"
                  options={{ title: 'Vrienden lijst' }}
                  component={FriendListScreen} />
                <Stack.Screen
                  name="AcceptFriendRequest"
                  options={{ title: 'Vrienden accepteren' }}
                  component={AcceptFriendRequestScreen} />
                <Stack.Screen
                  name="FriendReviews"
                  options={{ title: 'Online' }}
                  component={FriendReviewsScreen} />
              <Stack.Screen
                name="Register"
                options={{ title: 'Registreer' }}
                component={RegisterScreen} />
              <Stack.Screen
                name="ReviewDetail"
                component={ReviewDetailScreen}
                options={{ title: 'Review Details' }}
              />

        </Stack.Navigator>
      );
}