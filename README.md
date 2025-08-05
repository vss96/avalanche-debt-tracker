# 💳 Avalanche Debt Tracker

A smart debt management app that helps you optimize your debt payoff strategy using the **avalanche method** - prioritizing high-interest debts to save you the most money.

## ✨ Features

### 🎯 **Smart Debt Management**
- Add, edit, and delete debt entries
- Automatic 10% minimum payment calculation (or set your own)
- Real-time avalanche strategy recommendations
- Monthly payment breakdown with interactive timeline

### 🌍 **Multi-Currency Support**
- Auto-detects currency from browser locale
- Supports USD, EUR, GBP, CAD, AUD, JPY
- Proper currency formatting for your region

### 📊 **Avalanche Strategy**
- Prioritizes highest interest rate debts first
- Shows exactly how much to pay on each debt
- Calculates interest savings vs minimum payments
- Interactive 1-12 month payment preview

### 💾 **Data Persistence**
- All data stored locally in your browser
- Survives browser restarts and computer reboots
- Your financial data never leaves your device
- Export/import functionality for backups

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd avalanche-debt-tracker
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

4. **Try it out:**
- Click "Load Sample Data" to see the app in action
- Or start adding your own debts and available funds

## 📖 How to Use

### 1. **Set Your Available Funds**
- Enter your monthly income after rent, bills, and essentials
- Choose your currency (auto-detected from your location)
- This determines how much you can allocate to debt payments

### 2. **Add Your Debts**
- Enter creditor name, balance, and interest rate (APR)
- Minimum payment is optional - defaults to 10% of balance
- Add all your debts for the most accurate strategy

### 3. **Follow the Avalanche Strategy**
- App automatically sorts debts by interest rate (highest first)
- Pay minimums on all debts
- Put ALL extra money toward the highest interest debt
- Move to next highest when first debt is paid off

### 4. **Track Your Progress**
- Use the interactive timeline slider (1-12 months)
- See month-by-month breakdown of payments
- Track how much goes to interest vs principal
- Monitor your progress toward debt freedom

## 🧮 The Avalanche Method

The **debt avalanche** method saves you the most money by:

1. **Paying minimums** on all debts
2. **Targeting highest interest** debt with extra payments
3. **Cascading payments** as debts are eliminated
4. **Minimizing total interest** paid over time

**Example:** If you have a 24% credit card and 6% student loan, pay minimums on the student loan and attack the credit card first - even if the student loan balance is higher.

## 💰 Currency Support

**Supported Currencies:**
- 🇺🇸 USD (US Dollar)
- 🇪🇺 EUR (Euro)
- 🇬🇧 GBP (British Pound)
- 🇨🇦 CAD (Canadian Dollar)
- 🇦🇺 AUD (Australian Dollar)
- 🇯🇵 JPY (Japanese Yen)

**Auto-Detection Examples:**
- Browser set to `en-US` → USD
- Browser set to `en-GB` → GBP
- Browser set to `fr-FR` → EUR
- Browser set to `de-DE` → EUR

## 🏗️ Technical Details

### **Built With:**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Hooks** - Modern state management
- **localStorage** - Client-side data persistence

### **Key Components:**
- `DebtForm` - Add/edit debt entries
- `DebtList` - Display and manage debts
- `AvalancheDisplay` - Strategy recommendations
- `MonthlyBreakdown` - Interactive payment timeline
- `CurrencyContext` - Global currency management

### **Calculations:**
- Proper compound interest formulas
- APR to monthly rate conversion
- Loan payoff time calculations
- Interest savings projections

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run check` | Type check with TypeScript |

## 📱 Data Storage

- **Local Storage**: All data stored in browser localStorage
- **Privacy**: Your financial data never leaves your device
- **Persistence**: Data survives browser restarts
- **Backup**: Export/import functionality available

## 🎨 Customization

The app uses Tailwind CSS for styling. Key customization points:

- **Colors**: Update color schemes in component files
- **Currency**: Add new currencies in `src/types/debt.ts`
- **Calculations**: Modify algorithms in `src/utils/debtCalculations.ts`
- **Storage**: Extend localStorage utilities in `src/utils/localStorage.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**💡 Pro Tip:** The avalanche method typically saves more money than the snowball method (paying smallest balances first), especially with high-interest debt like credit cards!
