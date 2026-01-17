import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './FAQ.css';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "How do I place an order?",
            answer: "Simply browse our collections, select your size, and click 'Add to Cart'. Proceed to checkout to finalize your purchase."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit/debit cards, UPI, Net Banking, and Wallet payments secure via Razorpay."
        },
        {
            question: "How can I track my order?",
            answer: "Once your order is shipped, you will receive a tracking link via email and SMS. You can also view the status in the 'Orders' section of your account."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a hassle-free 7-day return policy for eligible items. Products must be unused, unwashed, and with original tags attached."
        },
        {
            question: "Do you ship internationally?",
            answer: "Currently, we operate and ship only within India. We plan to expand globally in the near future."
        }
    ];

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="faq-page">
            <Navbar />
            <div className="container faq-container">
                <h1 className="faq-title">Frequently Asked Questions</h1>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
                            <button className="faq-question" onClick={() => toggle(index)}>
                                {faq.question}
                                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
                            </button>
                            <div className="faq-answer">
                                <div className="faq-answer-inner">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default FAQ;
