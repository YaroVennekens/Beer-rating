/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/components/ColorPicker`; params?: Router.UnknownInputParams; } | { pathname: `/components/RatingComponents`; params?: Router.UnknownInputParams; } | { pathname: `/firebase/firebaseConfig`; params?: Router.UnknownInputParams; } | { pathname: `/interrface/ReviewInterface`; params?: Router.UnknownInputParams; } | { pathname: `/screens/HomeScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/MapScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/OverviewScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/AcceptFriendRequest`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/AddFriendScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/FriendListScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/FriendProfileScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/FriendReviewsScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/FriendsScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/function/FriendshipFunctions`; params?: Router.UnknownInputParams; } | { pathname: `/screens/minigame/mrwhite/GameSetup`; params?: Router.UnknownInputParams; } | { pathname: `/screens/minigame/mrwhite/PlayGameScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/review/CreateRatingScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/review/ReviewDetailScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/review/ReviewsScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/user/LoginScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/user/ProfileScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/user/RegisterScreen`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/components/ColorPicker`; params?: Router.UnknownOutputParams; } | { pathname: `/components/RatingComponents`; params?: Router.UnknownOutputParams; } | { pathname: `/firebase/firebaseConfig`; params?: Router.UnknownOutputParams; } | { pathname: `/interrface/ReviewInterface`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/HomeScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/MapScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/OverviewScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/friends/AcceptFriendRequest`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/friends/AddFriendScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/friends/FriendListScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/friends/FriendProfileScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/friends/FriendReviewsScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/friends/FriendsScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/friends/function/FriendshipFunctions`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/minigame/mrwhite/GameSetup`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/minigame/mrwhite/PlayGameScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/review/CreateRatingScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/review/ReviewDetailScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/review/ReviewsScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/user/LoginScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/user/ProfileScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/screens/user/RegisterScreen`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/components/ColorPicker${`?${string}` | `#${string}` | ''}` | `/components/RatingComponents${`?${string}` | `#${string}` | ''}` | `/firebase/firebaseConfig${`?${string}` | `#${string}` | ''}` | `/interrface/ReviewInterface${`?${string}` | `#${string}` | ''}` | `/screens/HomeScreen${`?${string}` | `#${string}` | ''}` | `/screens/MapScreen${`?${string}` | `#${string}` | ''}` | `/screens/OverviewScreen${`?${string}` | `#${string}` | ''}` | `/screens/friends/AcceptFriendRequest${`?${string}` | `#${string}` | ''}` | `/screens/friends/AddFriendScreen${`?${string}` | `#${string}` | ''}` | `/screens/friends/FriendListScreen${`?${string}` | `#${string}` | ''}` | `/screens/friends/FriendProfileScreen${`?${string}` | `#${string}` | ''}` | `/screens/friends/FriendReviewsScreen${`?${string}` | `#${string}` | ''}` | `/screens/friends/FriendsScreen${`?${string}` | `#${string}` | ''}` | `/screens/friends/function/FriendshipFunctions${`?${string}` | `#${string}` | ''}` | `/screens/minigame/mrwhite/GameSetup${`?${string}` | `#${string}` | ''}` | `/screens/minigame/mrwhite/PlayGameScreen${`?${string}` | `#${string}` | ''}` | `/screens/review/CreateRatingScreen${`?${string}` | `#${string}` | ''}` | `/screens/review/ReviewDetailScreen${`?${string}` | `#${string}` | ''}` | `/screens/review/ReviewsScreen${`?${string}` | `#${string}` | ''}` | `/screens/user/LoginScreen${`?${string}` | `#${string}` | ''}` | `/screens/user/ProfileScreen${`?${string}` | `#${string}` | ''}` | `/screens/user/RegisterScreen${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/components/ColorPicker`; params?: Router.UnknownInputParams; } | { pathname: `/components/RatingComponents`; params?: Router.UnknownInputParams; } | { pathname: `/firebase/firebaseConfig`; params?: Router.UnknownInputParams; } | { pathname: `/interrface/ReviewInterface`; params?: Router.UnknownInputParams; } | { pathname: `/screens/HomeScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/MapScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/OverviewScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/AcceptFriendRequest`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/AddFriendScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/FriendListScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/FriendProfileScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/FriendReviewsScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/FriendsScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/friends/function/FriendshipFunctions`; params?: Router.UnknownInputParams; } | { pathname: `/screens/minigame/mrwhite/GameSetup`; params?: Router.UnknownInputParams; } | { pathname: `/screens/minigame/mrwhite/PlayGameScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/review/CreateRatingScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/review/ReviewDetailScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/review/ReviewsScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/user/LoginScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/user/ProfileScreen`; params?: Router.UnknownInputParams; } | { pathname: `/screens/user/RegisterScreen`; params?: Router.UnknownInputParams; };
    }
  }
}
