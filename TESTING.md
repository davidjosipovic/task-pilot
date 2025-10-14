# TaskPilot Testing Documentation

## Test Coverage

TaskPilot includes comprehensive test suites for both backend and frontend to ensure code quality and reliability.

### Backend Tests (Jest + MongoDB Memory Server)

Located in `/backend/src/__tests__/`

#### Test Files:
- `userResolver.test.ts` - Authentication tests (9 tests)
- `projectTaskResolver.test.ts` - Project and Task CRUD tests (12 tests)

#### Running Backend Tests:

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

#### Backend Test Coverage:

**User Resolver (Authentication)**
- ✅ User registration with password hashing
- ✅ Duplicate email validation
- ✅ User login with correct credentials
- ✅ Invalid email/password error handling
- ✅ Get current user when authenticated
- ✅ Handle unauthenticated user requests

**Project Resolver**
- ✅ Create project with owner/member assignment
- ✅ Get user's projects
- ✅ Filter projects by membership
- ✅ Delete project and cascade delete tasks
- ✅ Authorization checks (only owner can delete)

**Task Resolver**
- ✅ Create task in project
- ✅ Update task title, description, and status
- ✅ Delete task
- ✅ Get tasks by project
- ✅ Member authorization for task operations

### Frontend Tests (Vitest + React Testing Library)

Located in `/frontend/src/__tests__/`

#### Test Files:
- `ProjectCard.test.tsx` - Project card component tests (4 tests)
- `TaskCard.test.tsx` - Task card component tests (6 tests)
- `Navbar.test.tsx` - Navigation component tests (4 tests)

#### Running Frontend Tests:

```bash
cd frontend

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

#### Frontend Test Coverage:

**ProjectCard Component**
- ✅ Renders project title and description
- ✅ Handles missing description
- ✅ Renders delete button
- ✅ Links to correct project detail page

**TaskCard Component**
- ✅ Renders task title
- ✅ Renders assigned user
- ✅ Handles unassigned tasks
- ✅ Status badge color coding (TODO/DOING/DONE)

**Navbar Component**
- ✅ Renders brand name
- ✅ Shows Login/Register when not authenticated
- ✅ Shows Dashboard/Logout when authenticated
- ✅ Correct routing links

## Test Technologies

### Backend:
- **Jest** - Testing framework
- **ts-jest** - TypeScript support for Jest
- **Supertest** - HTTP assertion library
- **MongoDB Memory Server** - In-memory MongoDB for testing

### Frontend:
- **Vitest** - Fast Vite-native test runner
- **React Testing Library** - React component testing
- **JSDOM** - DOM implementation for Node.js
- **@testing-library/jest-dom** - Custom DOM matchers

## Test Statistics

- **Total Tests**: 35
  - Backend: 21 tests
  - Frontend: 14 tests
- **Test Pass Rate**: 100%
- **Coverage**: Backend models, resolvers, and frontend components

## Continuous Integration Ready

These tests are ready to be integrated into CI/CD pipelines (GitHub Actions, GitLab CI, etc.) for automated testing on every commit.

Example GitHub Actions workflow:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test
```

## Best Practices Demonstrated

1. **Unit Testing**: Individual functions and components
2. **Integration Testing**: Database operations with real models
3. **Mocking**: Auth context and navigation for isolated tests
4. **Test Isolation**: Each test uses fresh database state
5. **Assertions**: Comprehensive expect statements
6. **Error Testing**: Validation and authorization errors
7. **Edge Cases**: Null values, missing data, unauthorized access

## Future Test Enhancements

- [ ] Add E2E tests with Playwright or Cypress
- [ ] Increase code coverage to 90%+
- [ ] Add performance/load testing
- [ ] Add API integration tests with real server
- [ ] Add visual regression testing for UI components
