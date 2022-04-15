import React, { Component } from "react";
import "./Header.css";
import { deviceType, isMobile } from "react-device-detect";
import classNames from "classnames";
import PropTypes from "prop-types";
import isArray from "lodash/isArray";
import isObject from "lodash/isObject";
import isString from "lodash/isString";
import isFunction from "lodash/isFunction";
import { Menubar } from "primereact/menubar";
import { PanelMenu } from "primereact/panelmenu";

import HeaderUtil from "../utils/HeaderUtil";

const HeaderMenuItemTemplate = (item, options) => {
    return (
        <a
            className={options.className}
            target={item.target}
            onClick={options.onClick}
            role="none"
        >
            {isString(item.icon) && <span className={options.iconClassName} />}
            <span className={options.labelClassName}>{item.label}</span>
            {isArray(item.items) && (
                <span className={options.submenuIconClassName} />
            )}
        </a>
    );
};

const BalanceHeaderMenuItemTemplate = (item, options) => (
    <a
        className={options.className}
        target={item.target}
        onClick={options.onClick}
        role="none"
    >
        <div className="menuitem-balance">
            <span
                className={classNames(options.labelClassName, {
                    "menuitem-balance-label": true,
                })}
            >
                <b>{item.balance}</b>
            </span>
            <span className={options.labelClassName}>{item.label}</span>
            <span className={options.submenuIconClassName} />
        </div>
    </a>
);

const MobileToggleButtonTemplate = (item, options) => (
    /* custom element */
    <a
        className={options.className}
        target={item.target}
        onClick={options.onClick}
        role="none"
    >
        <span className={classNames(options.iconClassName, "pi pi-bars")} />
        <span className={classNames(options.iconClassName, "pi pi-times")} />
    </a>
);

export default class Header extends Component {
    constructor(props) {
        super(props);

        this.state = {
            menuItems: null,
            page: "mail",
        };
    }

    componentDidMount() {
        this.buildHeaderItems();
    }

    buildHeaderItems = () => {
        this.setState({
            menuItems: HeaderUtil.buildHeaderMenuItems(),
        });
    };

    /**
     * Return menu items for Menubar.
     * @returns {array}
     */
    buildModel = () => {
        const { menuItems } = this.state;
        const screenType = this.getScreenType();

        if (!isObject(menuItems)) {
            return [];
        }

        const leftMenuItems = [
            menuItems.mail,
            menuItems.orders,
            menuItems.marketing,
            menuItems.products,
            menuItems.contacts,
            menuItems.history,
            menuItems.reports,
            menuItems.inbounds,
        ];

        if (screenType === "desktop") {
            return this._buildDesktopModel(leftMenuItems, [
                menuItems.balance,
                menuItems.account,
            ]);
        } else if (screenType === "tablet") {
            return this._buildTabletModel(leftMenuItems, [
                menuItems.supplies,
                menuItems.account,
                menuItems.balance,
                menuItems.help,
            ]);
        } else if (screenType === "phone") {
            return this._buildPhoneModel([
                ...leftMenuItems,
                menuItems.supplies,
                menuItems.account,
                menuItems.balance,
                menuItems.help,
            ]);
        }

        return null;
    };

    _buildDesktopModel = (leftMenuItems, rightMenuItems) => {
        const _right = rightMenuItems
            .filter((rootItem) => rootItem)
            .map((rootItem) => ({
                ...rootItem,
                className: "right-aligned-item",
                template:
                    rootItem.id === "balance"
                        ? BalanceHeaderMenuItemTemplate
                        : null,
                items: isArray(rootItem.items)
                    ? rootItem.items.map((subItem) =>
                          subItem.id === "signInform" ? null : subItem
                      )
                    : null,
            }));

        return [
            ...this._bindMenuItems(leftMenuItems),
            {
                separator: true,
            },
            ...this._bindMenuItems(_right),
        ];
    };

    _buildTabletModel = (leftMenuItems, rightMenuItems) => {
        // base model
        const model = this._bindMenuItems(leftMenuItems);

        // adding right toggle button
        model.push(
            {
                separator: true,
            },
            {
                label: "",
                icon: "pi pi-bars",
                className: "mobile-toggle-button right-aligned-item",
                items: [
                    {
                        template: () => (
                            <PanelMenu
                                className="panel-menu-tablet tablet"
                                model={this._bindMenuItems(
                                    rightMenuItems
                                        .filter((rootItem) => rootItem)
                                        .map((rootItem) => {
                                            if (rootItem.id === "signIn") {
                                                return {
                                                    ...rootItem,
                                                    items: null,
                                                };
                                            } else if (
                                                rootItem.id === "balance"
                                            ) {
                                                return {
                                                    ...rootItem,
                                                    label: isString(
                                                        rootItem.balance
                                                    )
                                                        ? `${rootItem.balance} ${rootItem.label}`
                                                        : rootItem.label,
                                                };
                                            }

                                            return rootItem;
                                        })
                                )}
                            />
                        ),
                    },
                ],
            }
        );

        return model;
    };

    _buildPhoneModel = (rightMenuItems) => [
        {
            separator: true,
        },
        {
            className: "mobile-toggle-button right-aligned-item",
            template: MobileToggleButtonTemplate,
            items: [
                {
                    template: () => (
                        <PanelMenu
                            className="panel-menu-phone phone"
                            model={this._bindMenuItems(
                                rightMenuItems
                                    .filter((rootItem) => rootItem)
                                    .map((rootItem) => {
                                        if (rootItem.id === "signIn") {
                                            return {
                                                ...rootItem,
                                                items: null,
                                            };
                                        } else if (rootItem.id === "balance") {
                                            return {
                                                ...rootItem,
                                                label: isString(
                                                    rootItem.balance
                                                )
                                                    ? `${rootItem.balance} ${rootItem.label}`
                                                    : rootItem.label,
                                            };
                                        }

                                        return rootItem;
                                    })
                            )}
                        />
                    ),
                },
            ],
        },
    ];

    /**
     * Loop through menu items data object, which is generated from HeaderUtil class, and
     * bind 'command' handler to the clickable items.
     *
     * @param {array} menuItems
     * @returns {array}
     */
    _bindMenuItems = (menuItems) => {
        const { page } = this.state;

        return menuItems
            .filter((rootItem) => rootItem)
            .reduce(
                (_menuItems, rootItem) => [
                    ..._menuItems,
                    {
                        ...rootItem,

                        // highlight root menu item
                        className: classNames(rootItem.className, {
                            "p-menuitem-active": rootItem.id === page,
                        }),

                        // use template
                        template: isFunction(rootItem.template)
                            ? rootItem.template
                            : HeaderMenuItemTemplate,

                        // bind click event handler
                        command: !isArray(rootItem.items)
                            ? this.onItemClick
                            : null,

                        // bind click event handler on child items
                        items: isArray(rootItem.items)
                            ? rootItem.items.map((subItem) => ({
                                  ...subItem,
                                  command: this.onItemClick,
                              }))
                            : null,
                    },
                ],
                []
            );
    };

    /**
     * Calculate screenType based on LayoutContext
     * @return {string} 'phone', 'tablet' or 'desktop'
     */
    getScreenType = () => {
        if (isMobile) {
            return deviceType === "mobile" ? "phone" : "tablet";
        }

        return "desktop";
    };

    handleNavigation = (item) => {
        console.log(`Navigate to id: ${id}`);
    };

    onItemClick = ({ item }) => {
        console.log(`Navigate to id: ${item?.id}`);
    };

    render() {
        const { plainHeader } = this.props;
        const screenType = this.getScreenType();

        return (
            <div
                className={classNames("common-header", {
                    "header-panel-desktop": screenType === "desktop",
                    "header-panel-tablet": screenType === "tablet",
                    "header-panel-phone": screenType === "phone",
                })}
            >
                {plainHeader === true ? (
                    <div
                        className={`app-logo ${screenType}`}
                        onClick={this.onHeaderLogoClick}
                        role="button"
                        tabIndex={0}
                        label="plain header"
                    />
                ) : (
                    <Menubar
                        start={<div className={`app-logo ${screenType}`} />}
                        model={this.buildModel(screenType)}
                    />
                )}
            </div>
        );
    }
}
