import React, { useState } from "react";
import { Checkbox, InputNumber } from "antd";
import "./App.css";

interface CartItem {
    name: string;
    price: number;
    category: string;
}

interface DiscountRule {
    campaign: string;
    category: "Coupon" | "On Top" | "Seasonal";
    type: string;
    ruleParameter: string[];
}

const discountRules: Record<string, DiscountRule> = {
    fixedAmount: {
        campaign: "Fixed Amount",
        category: "Coupon",
        type: "Fixed",
        ruleParameter: ["amount"]
    },
    percentage: {
        campaign: "Percentage",
        category: "Coupon",
        type: "Percentage",
        ruleParameter: ["percentage"]
    },
    categoryDiscount: {
        campaign: "Category Discount",
        category: "On Top",
        type: "CategoryPercentage",
        ruleParameter: ["itemCategory", "percentage"]
    },
    points: {
        campaign: "Points",
        category: "On Top",
        type: "Points",
        ruleParameter: ["points"]
    },
    seasonal: {
        campaign: "Seasonal",
        category: "Seasonal",
        type: "EveryX",
        ruleParameter: ["everyX", "discountY"]
    }
};

const AppDiscount: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([
        { name: "T-Shirt", price: 350, category: "Clothing" },
        { name: "Hat", price: 250, category: "Accessories" },
        { name: "Belt", price: 230, category: "Accessories" },
        { name: "Pants", price: 15, category: "Clothing" },
        { name: "Boots", price: 15, category: "Clothing" },
        { name: "Milk", price: 10, category: "Groceries" },
    ]);

    const [newItem, setNewItem] = useState<CartItem>({
        name: "",
        price: 0,
        category: ""
    });

    const [selectedDiscount, setSelectedDiscount] = useState<DiscountRule[]>([]);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);
    const [discountParams, setDiscountParams] = useState<Record<string, Record<string, number | string>>>({});

    const calculateTotalPrice = () => {
        return cartItems.reduce((sum, item) => sum + item.price, 0);
    };

    const handleDiscountParamChange = (campaign: string, param: string, value: number | string | null) => {
        setDiscountParams(prev => ({
            ...prev,
            [campaign]: {
                ...(prev[campaign] || {}),
                [param]: value ?? (typeof value === "number" ? 0 : "")
            }
        }));
    };
    

    const handleApplyDiscount = () => {
        let total = calculateTotalPrice();
        let totalDiscount = 0;
    
        selectedDiscount.forEach(discount => {
            const params = discountParams[discount.campaign] || {};
    
            switch (discount.type) {
                case "Fixed":
                    totalDiscount += Number(params.amount) || 0;
                    break;
                case "Percentage":
                    totalDiscount += total * ((Number(params.percentage) || 0) / 100);
                    break;
                case "CategoryPercentage":
                    const categoryTotal = cartItems
                        .filter(item => item.category === String(params.itemCategory))
                        .reduce((sum, item) => sum + item.price, 0);
                    totalDiscount += categoryTotal * ((Number(params.percentage) || 0) / 100);
                    break;
                case "Points":
                    const maxPointDiscount = total * 0.2;
                    totalDiscount += Math.min(Number(params.points) || 0, maxPointDiscount);
                    break;
                case "EveryX":
                    const times = Math.floor(total / (Number(params.everyX) || 1));
                    totalDiscount += times * (Number(params.discountY) || 0);
                    break;
            }
        });
    
        setDiscountAmount(totalDiscount);
        setFinalTotal(Math.max(0, total - totalDiscount));
    };
    

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItem.name && newItem.price > 0 && newItem.category) {
            setCartItems([...cartItems, newItem]);
            setNewItem({ name: "", price: 0, category: "" });
        }
    };

    const handleRemoveItem = (index: number) => {
        setCartItems(cartItems.filter((_, i) => i !== index));
    };
    console.log("API Key:", import.meta.env.VITE_API_KEY);

    return (
        <div className="container">
            <div className="app-container">
                <h2>Shopping Cart</h2>

                <form onSubmit={handleAddItem} className="add-item-form">
                    <h3>Add New Item </h3>
                    <div>
                        <input
                            type="text"
                            placeholder="Item Name"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={newItem.price || ""}
                            onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                        />
                        <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Electronics">Electronics</option>
                        </select>
                        <button type="submit">Add Item</button>
                    </div>
                </form>

                <div className="cart-items">
                    <h3>Items in Cart</h3>
                    <ul>
                        {cartItems.map((item, index) => (
                            <li key={index}>
                                {item.name} - {item.price} THB ({item.category})
                                <button onClick={() => handleRemoveItem(index)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="app-container">
                <h2 className="discounts-title">Discounts</h2>

                <div className="discounts-section">
                    <div className="discounts-list">
                        {Object.keys(discountRules).map((key, index) => {
                            const discount = discountRules[key];
                            return (
                                <div key={index} className="discount-item">
                                    <Checkbox
                                        className="discount-checkbox"
                                        onChange={() => {
                                            if (selectedDiscount.find((item) => item.campaign === discount.campaign) === undefined) {
                                                setSelectedDiscount([...selectedDiscount, discount]);
                                            } else {
                                                setSelectedDiscount(selectedDiscount.filter((item) => item.campaign !== discount.campaign));
                                            }
                                        }}
                                        checked={selectedDiscount.find((item) => item.campaign === discount.campaign) !== undefined}
                                    >
                                        {discount.campaign}
                                    </Checkbox>
                                    {selectedDiscount.find((item) => item.campaign === discount.campaign) !== undefined && (
                                        <div className="discount-inputs">{
                                            discount.ruleParameter.map((param, index) => (
                                                <div key={index} className="discount-input-wrapper">
                                                    <span className="discount-input-label">{param}:</span>
                                                    {discount.type === "CategoryPercentage" && param === "itemCategory" ? (
                                                        <select
                                                            value={discountParams[discount.campaign]?.[param] || ""}
                                                            onChange={(e) => handleDiscountParamChange(discount.campaign, param, e.target.value)}
                                                        >
                                                            <option value="">Select Category</option>
                                                            <option value="Clothing">Clothing</option>
                                                            <option value="Accessories">Accessories</option>
                                                            <option value="Electronics">Electronics</option>
                                                            <option value="Groceries">Groceries</option>
                                                        </select>
                                                    ) : (
                                                        <InputNumber
                                                            className="discount-number-input"
                                                            min={0}
                                                            max={discount.type === "Points" ? 20 : undefined}
                                                            value={discountParams[discount.campaign]?.[param] || 0}
                                                            onChange={(value) => handleDiscountParamChange(discount.campaign, param, value)}
                                                        />
                                                    )}
                                                </div>
                                            ))
                                        }</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button className="submit-btn" onClick={handleApplyDiscount}>
                    Apply Discount
                </button>

                {finalTotal > 0 && (
                    <div className="discount-summary">
                        <div className="discount-amount">Discount: -{discountAmount.toFixed(2) || 0} THB</div>
                        <div className="final-total">Final Total: {finalTotal.toFixed(2) || 0} THB</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppDiscount;
