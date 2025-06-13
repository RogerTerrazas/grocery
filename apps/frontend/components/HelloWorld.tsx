import React from 'react';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { trpc } from '../utils/trpc';

export const HelloWorld = () => {
  const greeting = trpc.hello.greeting.useQuery({ name: 'User' });

  if (greeting.isLoading) {
    return (
      <YStack style={{ padding: 16 }}>
        <Text>Loading...</Text>
      </YStack>
    );
  }

  if (greeting.error) {
    return (
      <YStack style={{ padding: 16 }}>
        <Text color="red">Error: {greeting.error.message}</Text>
      </YStack>
    );
  }

  return (
    <YStack style={{ padding: 16 }}>
      <Text fontSize="$6">{greeting.data?.greeting}</Text>
    </YStack>
  );
}; 