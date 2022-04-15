import isArray from "lodash/isArray";
import isNumber from "lodash/isNumber";
import isString from "lodash/isString";
import sessionData from "../data/session";

// create our number formatter to convert to USD currency
const CurrencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export default class HeaderUtil {
    /**
     * Build items object for Header (or PrimeReact/Menubar).
     *
     * @returns {object}
     */
    static buildHeaderMenuItems() {
        return {
            mail: {
                id: "mail",
                label: "Mail",
            },
            orders: this._getOrdersMenuItem(sessionData),
            marketing: this._getMarketingMenuItem(sessionData),
            products: this._getProductsMenuItem(sessionData),
            contacts: {
                id: "contacts",
                label: "Contacts",
            },
            history: this._getHistoryMenuItem(sessionData),
            reports: this._getReportsMenuItem(sessionData),
            inbounds: this._getInboundsMenuItem(sessionData),
            supplies: this._getSuppliesMenuItem(sessionData),
            balance: this._getBalanceMenuItem(sessionData),
            account: this._getAccountMenuItem(sessionData),
            help: {
                id: "help",
                label: "Help",
                navType: "newTab",
            },
        };
    }

    /**
     * Build MenuModel object of Orders for PrimeReact menus components.
     *
     * @returns {object|null}
     */
    static _getOrdersMenuItem({ isSignedIn }) {
        const isRestricted = !isSignedIn;

        return {
            id: "orders",
            label: "Orders",
            isRestricted,
            icon: !isSignedIn ? "pi pi-lock" : null, // show lock icon
        };
    }

    /**
     * Build MenuModel object of Marketing for PrimeReact menus components.
     *
     * @param {object} sessionData Session data.
     * @returns {object|null}
     */
    static _getMarketingMenuItem({ settings }) {
        return settings?.ShowMarketing === true
            ? {
                  id: "marketing",
                  label: "Marketing",
              }
            : null;
    }

    /**
     * Build MenuModel object of Products for PrimeReact menus components.
     *
     * @param {object} sessionData Session data.
     * @returns {object|null}
     */
    static _getProductsMenuItem({ settings }) {
        return settings?.HasShipStationToken === true
            ? {
                  id: "products",
                  label: "Products",
              }
            : null;
    }

    /**
     * Build MenuModel object of History for PrimeReact menus components.
     *
     * @param {object} sessionData Session data.
     * @returns {object}
     */
    static _getHistoryMenuItem({ isSignedIn, accountInfo }) {
        const isRestricted = !isSignedIn;
        const isGaPickupCarrier =
            isSignedIn && accountInfo.globalpost?.firstMileCarrier === "usps";

        return {
            id: "history",
            label: "History",
            isRestricted,
            icon: isRestricted === true ? "pi pi-lock" : null, // show lock icon
            items: [
                {
                    id: "searchPrintHistory",
                    label: "Search Print History",
                    isRestricted,
                    icon: isRestricted === true ? "pi pi-lock" : null, // show lock icon
                },
                {
                    id: "requestPostageRefund",
                    label: "Request a Postage Refund",
                },
                {
                    id: "fileInsuranceClaim",
                    label: "File an Insurance Claim",
                },
                {
                    id: "createScanForm",
                    label: "Create a SCAN Form",
                    isRestricted: isRestricted,
                    icon: isRestricted === true ? "pi pi-lock" : null, // show lock icon
                },
                {
                    id: "scheduleUspsPickUp",
                    label: "Schedule a USPS Pickup",
                },
                isGaPickupCarrier
                    ? {
                          id: "createContainerLabel",
                          label: "Create a Container Label",
                      }
                    : null,
            ].filter((item) => item),
        };
    }

    /**
     * Build MenuModel object of Reports for PrimeReact menus components.
     *
     * @param {object} sessionData Session data.
     * @returns {object|null}
     */
    static _getReportsMenuItem({ isSignedIn }) {
        const isRestricted = !isSignedIn;

        return {
            id: "reports",
            label: "Reports",
            isRestricted,
            icon: !isSignedIn === true ? "pi pi-lock" : null, // show lock icon
        };
    }

    /**
     * Build MenuModel object of Inbound for PrimeReact menus components.
     *
     * @param {object} sessionData Session data.
     * @returns {object|null}
     */
    static _getInboundsMenuItem({ accountInfo, isSignedIn }) {
        return isSignedIn && isArray(accountInfo?.configuredCarriers)
            ? {
                  id: "inbounds",
                  label: "Inbounds",
              }
            : null;
    }

    /**
     * Build MenuModel object of Supplies for PrimeReact menus components.
     *
     * @param {object} sessionData Session data.
     * @returns {object}
     */
    static _getSuppliesMenuItem({ isSignedIn, brand }) {
        const isRestricted = !isSignedIn;
        const baseMenuItem = {
            id: "supplies",
            label: "Supplies",
            isRestricted,
            icon: isRestricted === true ? "pi pi-lock" : null, // show lock icon
        };

        return brand?.brandName === "Endicia"
            ? baseMenuItem
            : {
                  ...baseMenuItem,
                  items: [
                      {
                          id: "netstamps",
                          label: "NetStamps",
                      },
                      {
                          id: "labels",
                          label: "Labels",
                      },
                      {
                          id: "shippingSupplies",
                          label: "Shipping Supplies",
                      },
                      {
                          id: "envelopes",
                          label: "Envelopes",
                      },
                      {
                          id: "freeUspsSupplies",
                          label: "Free USPS Supplies",
                      },
                  ],
              };
    }

    /**
     * Build MenuModel object of Balance for PrimeReact menus components.
     *
     * @param {object} sessionData Session data.
     * @returns {object|null}
     */
    static _getBalanceMenuItem({ balance, settings, isSignedIn }) {
        const page = isString(settings?.Page) ? settings.Page : "";

        if (
            isSignedIn &&
            page.search(
                /mail|orders|products|contacts|history|reports|inbounds/i
            ) !== -1
        ) {
            return {
                id: "balance",
                label: "Balance",
                balance: CurrencyFormatter.format(
                    isNumber(balance.amountAvailable)
                        ? balance.amountAvailable
                        : 0
                ),
                items: [
                    {
                        id: "buyMore",
                        label: "Buy More",
                    },
                    {
                        id: "viewPurchaseHistory",
                        label: "View Purchase History",
                    },
                    {
                        id: "changePaymentMethod",
                        label: "Change Payment Method",
                    },
                ],
            };
        }

        return null;
    }

    /**
     * Build MenuModel object of Account for PrimeReact menus components.
     *
     * @param {object} sessionData Session data.
     * @returns {object}
     */
    static _getAccountMenuItem({ isSignedIn, settings, accountInfo }) {
        const page = isString(settings.Page) ? settings.Page : "";
        const userName = accountInfo?.customerDetails?.username;

        return isSignedIn
            ? {
                  id: "userName",
                  label: userName,
                  items: [
                      page !== "account"
                          ? {
                                id: "manageAccount",
                                label: "Manage Account",
                            }
                          : null,
                      {
                          id: "legalTerms",
                          label: "Legal Terms",
                          navType: "newTab",
                      },
                      {
                          id: "signOut",
                          label: "Sign Out",
                      },
                  ].filter((item) => item),
              }
            : {
                  id: "signIn",
                  label: "Sign In",
                  items: [
                      {
                          id: "signInform", // custom template
                      },
                      {
                          id: "legalTerms",
                          label: "Legal Terms",
                          navType: "newTab",
                      },
                  ],
              };
    }
}
