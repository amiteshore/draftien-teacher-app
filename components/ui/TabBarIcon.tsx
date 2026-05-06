import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

type TabBarIconProps = {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  focused?: boolean;
};

export const TabBarIcon = ({ name, color, focused }: TabBarIconProps) => {
  const getIconName = () => {
    if (!focused) return name;

    if (name.endsWith("-outline")) {
      return name.replace("-outline", "") as React.ComponentProps<typeof Ionicons>["name"];
    }

    return name;
  };

  return (
    <View>
      <Ionicons name={getIconName()} size={22} color={color} />
    </View>
  );
};
