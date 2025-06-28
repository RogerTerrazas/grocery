import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import { Alert as RNAlert } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  Dialog,
  Adapt,
  Sheet,
  useTheme,
} from "tamagui";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertOptions {
  cancelable?: boolean;
}

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  options?: AlertOptions;
}

// Global state for web alerts
let alertState: AlertState = {
  visible: false,
  title: "",
  message: "",
  buttons: [],
  options: {},
};

let setAlertState: React.Dispatch<React.SetStateAction<AlertState>> | null =
  null;

// Web Alert Component
const WebAlertDialog: React.FC = () => {
  const [state, setState] = useState<AlertState>(alertState);
  const theme = useTheme();

  useEffect(() => {
    setAlertState = setState;
    return () => {
      setAlertState = null;
    };
  }, []);

  const handleButtonPress = (button: AlertButton) => {
    setState((prev) => ({ ...prev, visible: false }));
    if (button.onPress) {
      // Small delay to allow dialog to close smoothly
      setTimeout(button.onPress, 100);
    }
  };

  const handleBackdropPress = () => {
    if (state.options?.cancelable !== false) {
      setState((prev) => ({ ...prev, visible: false }));
    }
  };

  if (!state.visible) return null;

  return (
    <Dialog modal open={state.visible} onOpenChange={handleBackdropPress}>
      <Adapt when="sm" platform="touch">
        <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="slow"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="rgba(0,0,0,0.5)"
        />
        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
          padding="$4"
          backgroundColor={theme.background.get()}
          borderColor={theme.borderColor.get()}
          borderRadius="$4"
          maxWidth={400}
          minWidth={300}
        >
          <YStack gap="$3">
            {/* Title */}
            <Text
              fontSize="$6"
              fontWeight="600"
              color={theme.color.get()}
              textAlign="center"
            >
              {state.title}
            </Text>

            {/* Message */}
            {state.message && (
              <Text
                fontSize="$4"
                color={theme.color.get()}
                textAlign="center"
                opacity={0.8}
                lineHeight="$5"
              >
                {state.message}
              </Text>
            )}

            {/* Buttons */}
            <XStack gap="$2" justifyContent="flex-end" marginTop="$2">
              {state.buttons.map((button, index) => {
                let buttonColor = theme.blue10.get();
                let textColor = "white";

                if (button.style === "cancel") {
                  buttonColor = theme.gray8.get();
                  textColor = theme.color.get();
                } else if (button.style === "destructive") {
                  buttonColor = theme.red10.get();
                  textColor = "white";
                }

                return (
                  <Button
                    key={index}
                    size="$3"
                    backgroundColor={buttonColor}
                    color={textColor}
                    onPress={() => handleButtonPress(button)}
                    flex={state.buttons.length === 1 ? 1 : undefined}
                    minWidth={state.buttons.length > 1 ? 80 : undefined}
                  >
                    {button.text}
                  </Button>
                );
              })}
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

// Cross-platform Alert class
export class CrossPlatformAlert {
  static alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ): void {
    // Use native Alert on iOS and Android
    if (Platform.OS === "ios" || Platform.OS === "android") {
      const nativeButtons = buttons?.map((button) => ({
        text: button.text,
        onPress: button.onPress,
        style: button.style,
      })) || [{ text: "OK" }];

      RNAlert.alert(title, message, nativeButtons, options);
      return;
    }

    // Use custom dialog on web
    if (setAlertState) {
      const alertButtons = buttons || [{ text: "OK" }];

      setAlertState({
        visible: true,
        title,
        message,
        buttons: alertButtons,
        options,
      });
    } else {
      // Fallback to browser alert if component not mounted
      const alertMessage = message ? `${title}\n\n${message}` : title;
      window.alert(alertMessage);
    }
  }
}

// Export the web dialog component for mounting in the app
export { WebAlertDialog };

// Default export for convenience
export default CrossPlatformAlert;
