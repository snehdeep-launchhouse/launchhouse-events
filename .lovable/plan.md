
# Investigation & Fix Plan for Internal Errors

## Problem Analysis
Based on the uploaded console logs, there are two types of errors:

1. **TikTok Ads SDK Errors**: "Event name (plan_interacted/details_view_toggled) is not valid, must be mapped to one of standard events"
2. **TrajectoryEvent Unknown Errors**: Repeated unknown trajectory events

## Current State Investigation Needed
1. **Check Pricing Page Current State**: Verify what calculator integration exists
2. **Identify TikTok Ads Integration**: Find where TikTok tracking code is implemented
3. **Review Console Logs**: Get full error context from live site
4. **Check Calculator Implementation**: Verify if EventComplexityCalculator is properly integrated

## Root Cause Analysis
The errors suggest:
- TikTok Ads tracking is firing invalid event names
- There may be tracking/analytics conflicts
- Calculator integration might be triggering unwanted events

## Solution Strategy
1. **TikTok Ads Fix**: 
   - Locate TikTok tracking implementation
   - Remove or fix invalid event mappings (plan_interacted, details_view_toggled)
   - Use standard TikTok event names only

2. **Calculator Integration Options**:
   - **Option A**: Hide calculator on pricing page but keep functionality available via direct route
   - **Option B**: Remove calculator from pricing page entirely and create separate calculator page
   - **Option C**: Keep calculator but disable all tracking events

3. **Error Cleanup**:
   - Remove or fix trajectory event tracking
   - Ensure no conflicting analytics implementations
   - Test that core functionality works without tracking errors

## Implementation Plan
1. **Locate and Fix TikTok Integration** - Find tracking code causing invalid events
2. **Handle Calculator Visibility** - Hide calculator section on pricing page while preserving functionality
3. **Clean Up Analytics** - Remove problematic event tracking
4. **Verify Core Functions** - Ensure lead capture and AI assistant still work
5. **Test Error Resolution** - Confirm console is clean

## Technical Approach
- Use CSS `display: none` or conditional rendering to hide calculator
- Remove invalid TikTok event mappings
- Preserve database and lead capture functionality
- Maintain AI assistant integration without tracking conflicts

This approach will resolve the internal errors while respecting the user's requirement to not modify the pricing page visibly.
