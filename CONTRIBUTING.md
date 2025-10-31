# Contributing to WORKORG

Thank you for considering contributing to WORKORG! 🎉

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, Node version, etc.)

### Suggesting Features

1. Open an issue with the "enhancement" label
2. Describe the feature and its use case
3. Explain why this feature would be useful

### Pull Requests

1. **Fork the repository**
```bash
git clone https://github.com/yourusername/workorg.git
cd workorg
```

2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
   - Follow the existing code style
   - Write clear commit messages
   - Add comments where necessary
   - Update documentation if needed

4. **Test your changes**
```bash
# Start MongoDB
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev

# Test the feature thoroughly
```

5. **Commit your changes**
```bash
git add .
git commit -m "feat: add amazing feature"
```

Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting, missing semicolons, etc.
- `refactor:` code restructuring
- `test:` adding tests
- `chore:` maintenance tasks

6. **Push to your fork**
```bash
git push origin feature/amazing-feature
```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes
   - Link any related issues

## Code Style

### TypeScript/JavaScript
- Use TypeScript for new files
- Use functional components in React
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### CSS/Tailwind
- Use Tailwind utility classes
- Keep custom CSS minimal
- Follow mobile-first approach
- Maintain consistent spacing

### Backend
- Use async/await instead of callbacks
- Add error handling for all routes
- Validate user input
- Add comments for complex logic

## Project Structure

```
workorg/
├── client/           # Next.js frontend
│   ├── src/
│   │   ├── app/     # Pages
│   │   ├── components/
│   │   ├── lib/     # Utils
│   │   └── store/   # State
├── server/          # Express backend
│   ├── src/
│   │   ├── models/  # DB models
│   │   ├── routes/  # API routes
│   │   └── middleware/
```

## Development Workflow

1. Always pull latest changes before starting
```bash
git pull origin main
```

2. Keep commits focused and atomic
3. Write descriptive commit messages
4. Test thoroughly before pushing
5. Keep PRs focused on one feature/fix

## Questions?

Feel free to:
- Open an issue for questions
- Discuss in pull requests
- Reach out to maintainers

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the project

---

Thank you for contributing! 🙏

