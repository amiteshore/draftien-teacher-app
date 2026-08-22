import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─────────────────────────────────────────────
// Video Player
// ─────────────────────────────────────────────

function VideoPlayer({ uri, title }: { uri: string; title: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.play();
  });

  const ref = useRef(null);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <VideoView
        ref={ref}
        player={player}
        style={{ flex: 1 }}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
        nativeControls
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// PDF Viewer
// ─────────────────────────────────────────────

function PdfViewer({ uri, title }: { uri: string; title: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <Pdf
        source={{ uri, cache: true }}
        style={{ flex: 1, width: "100%" }}
        trustAllCerts={false}
        renderActivityIndicator={() => (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 14 }}>Loading PDF…</Text>
          </View>
        )}
        onError={(error) => {
          console.error("PDF error:", error);
        }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────

export default function LectureViewer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { url, type, title } = useLocalSearchParams<{
    url: string;
    type: "video" | "pdf";
    title: string;
  }>();

  // Hide status bar for video, show for PDF
  useEffect(() => {
    if (type === "video") {
      StatusBar.setHidden(true, "fade");
    }
    return () => {
      StatusBar.setHidden(false, "fade");
    };
  }, [type]);

  if (!url) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <Text style={{ color: "#EF4444", fontSize: 16 }}>No content URL provided</Text>
        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: 16, backgroundColor: "#2563EB", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: type === "video" ? "#000" : "#fff" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          backgroundColor: type === "video" ? "#000" : "#fff",
          borderBottomWidth: type === "pdf" ? 1 : 0,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ marginRight: 12 }}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={type === "video" ? "#fff" : "#111827"}
          />
        </Pressable>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: "600",
            color: type === "video" ? "#fff" : "#111827",
          }}
        >
          {title || "Lecture"}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: type === "video" ? "rgba(255,255,255,0.15)" : "#F3F4F6",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <Ionicons
            name={type === "video" ? "videocam" : "document-text"}
            size={13}
            color={type === "video" ? "#fff" : "#6B7280"}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: type === "video" ? "#fff" : "#6B7280",
              textTransform: "uppercase",
            }}
          >
            {type}
          </Text>
        </View>
      </View>

      {/* Content */}
      {type === "video" ? (
        <VideoPlayer uri={url} title={title || "Lecture"} />
      ) : (
        <PdfViewer uri={url} title={title || "Lecture"} />
      )}
    </View>
  );
}
