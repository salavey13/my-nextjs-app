# Game Progression Testing Guide

This guide outlines the steps to test the full progression through the story stages.

## Main Story Progression

1. **Stage 0 to 1**: 
   - Start the game
   - Play both card and dice games
   - Verify that the Hack Button appears

2. **Stage 1 to 2**:
   - Click the Hack Button
   - Verify that the skin shop is unlocked

3. **Stage 2 to 3**:
   - Purchase a skin from the skin shop
   - Verify that the Crypto Wallet is unlocked

4. **Stage 3 to 4**:
   - Set up the Crypto Wallet (add a wallet address in the profile)
   - Verify that Events are unlocked

5. **Stage 4 to 5**:
   - Participate in an event (place a bet)
   - Verify that Rents are unlocked

6. **Stage 5 to 6**:
   - Interact with a rental item
   - Verify that Versimcel is unlocked

7. **Stage 6 to 7**:
   - Complete the Versimcel debugging minigame
   - Verify that GitHub access is unlocked

8. **Stage 7**:
   - Complete the GitHub source retrieval minigame
   - Verify that admin access is unlocked

## Side Hustle Progression

After each main stage progression, check for available side hustles:

1. **QR Code Generator** (Stage 3):
   - Complete the QR Code Generation minigame
   - Verify the "QR Code Master" achievement

2. **Dynamic Form Creation** (Stage 4):
   - Complete the Form Builder minigame
   - Verify the "Form Wizard" achievement

3. **Payment Notifications** (Stage 5):
   - Complete the Payment Simulator minigame
   - Verify the "Financial Overseer" achievement

4. **Conflict Awareness** (Stage 6):
   - Complete the Conflict Simulator minigame
   - Verify the "Chaos Navigator" achievement

5. **Versimcel Creation** (Stages 0-7):
   - At each stage, check if the Versimcel Creator minigame is available
   - Complete the Versimcel Creator minigame
   - Verify that a new component is created and added to the game

## Additional Tests

- Verify that the DevKit allows setting any stage and unlocking/locking components appropriately
- Check that the admin component is only unlockable at stage 7
- Ensure that side hustles are offered at appropriate stages and don't interfere with main story progression
- Test the crash simulation after the 13th Hack Button click
- Verify that all unlocked components are accessible in the bottom shelf

Remember to test edge cases, such as:
- Progressing through stages out of order using the DevKit
- Attempting to access locked components
- Verifying that game state is saved correctly between sessions