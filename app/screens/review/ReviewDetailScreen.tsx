import React, { FunctionComponent, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  FlatList,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { RouteProp } from "@react-navigation/native";
import { formatDate, renderStars } from "@/app/components/RatingComponents";
import { fetchUsername } from "@/app/screens/friends/function/FriendshipFunctions";
import { Rating } from "@/app/interrface/ReviewInterface";
import { RootStackParamList } from "@/app";
import { ref, set, push, get } from "firebase/database";
import { db } from "@/app/firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

type ReviewDetailScreenRouteProp = RouteProp<RootStackParamList, "ReviewDetail">;

type ReviewDetailScreenProps = {
  route: ReviewDetailScreenRouteProp;
};

const ReviewDetailScreen: FunctionComponent<ReviewDetailScreenProps> = ({
                                                                          route,
                                                                        }) => {
  const { rating, friendId, avatarColor } = route.params;

  const [username, setUsername] = useState<string>("Laden...");
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userAvatars, setUserAvatars] = useState<{ [key: string]: string }>({});
  const currentUserId = getAuth().currentUser?.uid;

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const fetchedUsername = await fetchUsername(friendId);
        setUsername(fetchedUsername || "Onbekende gebruiker");
      } catch (error) {
        console.error("Error fetching username:", error);
        setUsername("Onbekende gebruiker");
      }
    };

    void loadUsername();
  }, [friendId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsRef = ref(
          db,
          `users/${friendId}/reviews/${rating.key}/comments`
        );
        const snapshot = await get(commentsRef);
        const commentsData = snapshot.val() || {};

        const avatarPromises = Object.keys(commentsData).map(async (key) => {
          const comment = commentsData[key];
          const userAvatarColor = await fetchAvatarColor(comment.userId);
          return { userId: comment.userId, avatarColor: userAvatarColor };
        });

        const avatars = await Promise.all(avatarPromises);
        const userAvatarMap = avatars.reduce((acc, { userId, avatarColor }) => {
          acc[userId] = avatarColor;
          return acc;
        }, {});

        setUserAvatars(userAvatarMap);
        setComments(Object.values(commentsData));
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [friendId, rating.key]);

  const fetchAvatarColor = async (userId: string): Promise<string> => {
    try {
      const userRef = ref(db, `users/${userId}/avatarColor`);
      const snapshot = await get(userRef);
      return snapshot.val() || "#4CAF50"; // Default color
    } catch {
      return "#4CAF50"; // Default color
    }
  };

  const addComment = async () => {
    if (!rating.key) {
      Alert.alert("Error", "Review ID is missing");
      return;
    }

    if (comment.trim()) {
      const newComment = {
        userId: currentUserId,
        content: comment,
        timestamp: Date.now(),
      };

      setLoading(true);

      try {
        const commentsRef = ref(
          db,
          `users/${friendId}/reviews/${rating.key}/comments`
        );
        const newCommentRef = push(commentsRef);
        await set(newCommentRef, newComment);
        setComment("");
        setComments((prevComments) => [...prevComments, newComment]);
      } catch (error) {
        console.error("Error adding comment:", error);
        Alert.alert("Error", "Kan het commentaar niet toevoegen.");
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("Leeg commentaar", "Je kunt geen leeg commentaar toevoegen.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Reviewer Info */}
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: avatarColor || "#4CAF50" },
          ]}
        >
          <Text style={styles.avatarText}>
            {(username === "Unknown" ? "Ik" : username.substring(0, 2)).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.headerTitle}>
          {username === "Unknown" ? "Mijn review" : username}
        </Text>
      </View>

      {/* Review Details */}
      <View style={styles.section}>
        <Text style={styles.title}>Overzicht</Text>
        <Text style={styles.label}>{rating.beerName.toUpperCase()}</Text>
        <Text style={styles.date}>{formatDate(rating.timestamp)}</Text>
        <Text style={styles.text}>{rating.review || "Geen recensie beschikbaar."}</Text>
        <Text style={styles.text}>{renderStars(rating.rating)}</Text>
      </View>

      {/* Bar Information */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Bar</Text>
        <Text style={styles.text}>{rating.bar || "Geen bar informatie beschikbaar."}</Text>
      </View>

      {/* Location Map */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Locatie</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: rating.spotLatitude,
            longitude: rating.spotLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false} // Disables dragging
          zoomEnabled={false} // Disables zooming
        >
          <Marker
            coordinate={{
              latitude: rating.spotLatitude,
              longitude: rating.spotLongitude,
            }}
            title={rating.beerName}
            description={renderStars(rating.rating)}
          />
        </MapView>
      </View>

      {/* Comments Section */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Feedback</Text>
        <FlatList
          data={comments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: userAvatars[item.userId] || "#4CAF50" },
                ]}
              >
                <Text style={styles.avatarText}>
                  {fetchUsername(item.userId).then((value) =>
                    value.substring(0, 2)
                  )}
                </Text>
              </View>
              <View style={styles.commentDetails}>
                <Text style={styles.commentUsername}>
                  @{fetchUsername(item.userId)}
                </Text>
                <Text style={styles.commentContent}>{item.content}</Text>
              </View>
            </View>
          )}
        />
        <View style={styles.commentInputSection}>
          <TextInput
            style={styles.commentInput}
            placeholder="Voeg een commentaar toe"
            value={comment}
            onChangeText={setComment}
          />
          <Button title="Plaats commentaar" onPress={addComment} />
          {loading && (
            <ActivityIndicator
              style={styles.loadingIndicator}
              size="small"
              color="#0000ff"
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  label: {
    fontSize: 18,
    color: "#333",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 6,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  commentItem: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  commentDetails: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 16,
    color: "#333",
  },
  commentInputSection: {
    marginTop: 16,
    flexDirection: "column",
  },
  commentInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  loadingIndicator: {
    marginTop: 10,
    alignSelf: "center",
  },
});

export default ReviewDetailScreen;