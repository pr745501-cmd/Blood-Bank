# Bugfix Requirements Document

## Introduction

When a logged-in user searches for donors on the `/find-donor` page, their own donor profile appears in the results. This is incorrect — a user has no reason to contact themselves as a donor, and seeing their own card in results is confusing and misleading. The fix must exclude the currently authenticated user's donor record from search results while preserving all other search behavior.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a logged-in user searches for donors by blood group THEN the system returns the user's own donor profile in the results list
1.2 WHEN a logged-in user views the donor search results THEN the system displays their own name, phone number, and contact buttons pointing back to themselves

### Expected Behavior (Correct)

2.1 WHEN a logged-in user searches for donors by blood group THEN the system SHALL exclude the current user's own donor profile from the results
2.2 WHEN a logged-in user views the donor search results THEN the system SHALL only display other donors, never the user's own card

### Unchanged Behavior (Regression Prevention)

3.1 WHEN an unauthenticated user searches for donors by blood group THEN the system SHALL CONTINUE TO return all matching donors without exclusion
3.2 WHEN a logged-in user searches for a blood group they do not belong to THEN the system SHALL CONTINUE TO return all matching donors of that blood group
3.3 WHEN a logged-in user searches for donors and there are no other matching donors THEN the system SHALL CONTINUE TO display the "No Donors Found" empty state
3.4 WHEN a logged-in user searches for donors THEN the system SHALL CONTINUE TO sort results with available donors first
3.5 WHEN an admin views the donor list THEN the system SHALL CONTINUE TO show all donors including the admin's own record (admin views are unaffected)

---

## Bug Condition

**Bug Condition Function:**
```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type SearchRequest { bloodGroup, requestingUserId }
  OUTPUT: boolean

  // Returns true when the requesting user has a donor profile matching the search
  RETURN X.requestingUserId IS NOT NULL
    AND EXISTS donor WHERE donor.user = X.requestingUserId
    AND donor.bloodGroup = X.bloodGroup
END FUNCTION
```

**Property: Fix Checking**
```pascal
FOR ALL X WHERE isBugCondition(X) DO
  results ← searchDonors'(X.bloodGroup, X.requestingUserId)
  ASSERT NOT EXISTS d IN results WHERE d.user = X.requestingUserId
END FOR
```

**Property: Preservation Checking**
```pascal
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT searchDonors(X.bloodGroup, null) = searchDonors'(X.bloodGroup, null)
END FOR
```
