
# Plan: Complete Event Complexity Calculator Implementation & QA Audit

## Current State Analysis
- Core systems (AI assistant, edge functions, database) are working correctly
- Calculator data/logic exists in `src/lib/calculator-data.ts`
- LeadForm component exists but calculator UI component is missing entirely
- Error ID `0401a75e93f50f7991f9942f2d5d5ad2` appears to be non-critical console noise

## Implementation Plan

### Phase 1: Build Missing Calculator Component
1. **Create EventComplexityCalculator Component**
   - Multi-step question flow using calculator-data.ts questions
   - Progress indicator and smooth transitions
   - Mobile-responsive design matching existing style
   - Result display with complexity tier and pricing

2. **Integrate Calculator into Pricing Page**
   - Add calculator section before pricing packages
   - Connect to existing LeadForm component
   - Ensure proper data flow to analyze-event edge function

3. **Calculator Logic Implementation**
   - Use existing calculation engine from calculator-data.ts
   - Implement all complexity rules and overrides
   - Connect Cvent product inference logic
   - Add debug tracing for testing

### Phase 2: Comprehensive QA Testing
4. **Calculator Logic Validation**
   - Test all 10+ question scenarios
   - Verify complexity tier calculations
   - Test product inference rules
   - Validate minimum complexity overrides

5. **User Experience Testing**
   - Complete user flow testing
   - Mobile responsiveness validation
   - Form submission to database verification
   - Lead capture confirmation workflow

6. **AI Assistant Integration**
   - Test calculator guidance from chatbot
   - Verify consultation redirects
   - Validate cross-component communication

7. **Database & Security Validation**
   - Test lead storage to event_complexity_leads table
   - Verify all field mappings work correctly
   - Validate error handling for edge cases

## Technical Approach
- Build calculator as self-contained component with internal state management
- Use existing UI patterns from project (shadcn components)
- Implement smooth animations and transitions
- Connect to existing edge functions and database schema
- Maintain accessibility and mobile-first design

## Success Criteria
- Calculator displays properly on /pricing page
- All complexity calculation rules work as specified
- Complete user journey from questions → result → lead capture
- AI assistant properly guides users to calculator
- Database captures all lead information correctly
- No console errors or functional issues
