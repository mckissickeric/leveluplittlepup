class TipManager {
    constructor() {
        this.tipDisplay = document.getElementById('tip-display');
        this.tipContent = document.querySelector('.tip-content');
        this.tips = {
            protein: [
                "Eat protein! Like steak!",
                "Time your protein! Eat right after a workout!",
                "Eat fatty fish like salmon!"
            ],
            veggie: [
                "Eat veggies for the results!",
                "Make smoothies with seeds, nuts, and fruits!",
                "Learn different flavors and become a great chef!"
            ],
            vitamin: [
                "Learn the different vitamins and minerals!",
                "Use anti-inflammatory spices turmeric & ginger!",
                "Drink fancy teas and raise that pinky finger high!"
            ],
            junk: [
                "Avoid sugary foods & drinks!",
                "Limit fat human foods like pizza & French fries!",
                "Ban bad foods from your lifestyle! Be strong!"
            ]
        };
        this.currentTimeout = null;
    }

    showTip(type) {
        const tipList = this.tips[type];
        const tip = tipList[Math.floor(Math.random() * tipList.length)];
        
        this.tipContent.textContent = tip;
        this.tipDisplay.classList.remove('hidden');
        
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
        }
        
        this.currentTimeout = setTimeout(() => {
            this.tipDisplay.classList.add('hidden');
        }, 3000);
    }
}
