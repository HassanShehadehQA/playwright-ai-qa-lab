export const SauceUsers = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
} as const;

export const InvalidData = {
  incorrectPassword: 'IncorrectPw',
} as const;

export const ErrorMsgs = {
  invalidUserPassword: 'Epic sadface: Username and password do not match any user in this service',
  userLockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
} as const;

export const TitlesHeaders = {
  mainTitle: 'Swag Labs',
  productHeader: 'Products',
  checkoutInfoHeader: 'Checkout: Your Information',
  cartHeader: 'Your Cart',
} as const;

export const SauceRoutes = {
  productsMainPage: /\/inventory\.html$/,
  loginPage: '/',
  cartPage: /\/cart\.html$/,
  checkoutInfoPage: /\/checkout-step-one\.html$/,
} as const;

export const SauceProducts = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
} as const;

export const SauceSortOptions = {
  nameAToZ: 'az',
  nameZToA: 'za',
  priceLowToHigh: 'lohi',
  priceHighToLow: 'hilo',
} as const;
