// Define a pool of premium gradient colors for categories
const premiumChartGradients = [
    { stop1: "#00C9FF", stop2: "#92FE9D" }, // Bright aqua-green
    { stop1: "#FF6A00", stop2: "#FFB347" }, // Bright orange-peach
    { stop1: "#DA22FF", stop2: "#9733EE" }, // Bright purple
    { stop1: "#FDC830", stop2: "#F37335" }, // Bright yellow-orange
    { stop1: "#43CEA2", stop2: "#185A9D" }, // Bright teal-blue
    { stop1: "#F5515F", stop2: "#A1051D" }, // Bright red
    { stop1: "#7F00FF", stop2: "#E100FF" }  // Bright violet-magenta
];


// Function to render the landing page chart with predefined categories and sample data
function renderLandingPageChart() {
    const chartDiv = document.querySelector("#chart");
    if (!chartDiv) {
        console.error("Chart div not found in index.html");
        return;
    }

    const gradientDefsSvg = document.querySelector("#gradientDefsSvg");
    if (!gradientDefsSvg) {
        console.error("Gradient defs SVG not found in index.html");
        return;
    }
    gradientDefsSvg.innerHTML = ""; // Clear previous gradients

    const labels = ['Savings', 'Expense'];
    const series = [127500, 97500]; // Sample data for Income and Expense

    let svgDefs = `<defs>`;
    let chartColors = [];

    labels.forEach((label, index) => {
        const gradient = premiumChartGradients[index % premiumChartGradients.length]; // Cycle through gradients
        const gradientId = `${label.toLowerCase()}Gradient`;
        svgDefs += `
            <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="${gradient.stop1}"/>
                <stop offset="100%" stop-color="${gradient.stop2}"/>
            </linearGradient>
        `;
        chartColors.push(`url(#${gradientId})`);
    });
    svgDefs += `</defs>`;
    gradientDefsSvg.innerHTML = svgDefs; // Inject dynamic SVG gradients into the hidden SVG

    var options = {
        series: series,
        chart: {
            type: 'donut',
            width: '100%',
            background: 'transparent',
            fontFamily: 'Inter, sans-serif',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 1500,
                animateGradually: {
                    enabled: true,
                    delay: 300
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 500
                }
            },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 4,
                color: '#010101',
                opacity: .1
            }
        },
        labels: labels, // Use dynamic labels
        colors: chartColors, // Use dynamic colors
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: "radial",
                shadeIntensity: 1,
                gradientToColors: ['#54c0ff', '#57fad7'], // Original gradient colors
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        legend: {
            position: 'bottom',
            fontSize: '18px',
            labels: {
                colors: '#fff'
            },
            markers: {
                width: 18,
                height: 18,
                strokeWidth: 0,
                radius: 12,
            },
            itemMargin: {
                horizontal: 16,
                vertical: 10
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                colors: ['#fff']
            },
            dropShadow: {
                enabled: true,
                opacity: 0.4
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '22px',
                            color: '#fff',
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '20px',
                            fontWeight: 600,
                            color: '#fff', // Original income color
                            offsetY: 10,
                            formatter: function (val) {
                                return '₹' + val;
                            }
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '20px',
                            color: '#fff', // Original income color
                            formatter: function (w) {
                                return '₹' + w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            }
                        }
                    }
                },
                expandOnClick: true
            }
        },
        stroke: {
            width: 0
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (val) {
                    return "₹" + val;
                }
            },
            custom: function({series, seriesIndex, w}) {
                const value = series[seriesIndex];
                const label = w.globals.labels[seriesIndex];
                const total = series.reduce((a, b) => a + b, 0);
                const percent = (total > 0) ? ((value / total) * 100).toFixed(1) : "0.0"; // Handle division by zero
                return `
                    <div class='p-2'>
                        <div class='font-bold text-lg'>${label}</div>
                        <div>Amount: <span class='font-semibold text-[#1de9b6]'>₹${value}</span></div>
                        <div>Percentage: <span class='font-semibold'>${percent}%</span></div>
                    </div>
                `;
            }
        },
        responsive: [{
            breakpoint: 768,
            options: {
                chart: {
                    width: '100%',
                    height: 400
                },
                legend: {
                    fontSize: '15px'
                }
            }
        }]
    };

    var chart = new ApexCharts(chartDiv, options);
    chart.render();
}

function renderLandingBarChart() {
    const barCanvas = document.getElementById('barChart');
    if (!barCanvas) return;
    const ctx = barCanvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Income',
                data: [12000, 15000, 11000, 18000, 17000, 16000],
                backgroundColor: 'rgba(49, 162, 253, 0.7)',
                borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Donut chart render
renderLandingPageChart();

const featuresBtn = document.querySelector('.features-btn');
const featureArrow = document.querySelector('.feature-arrow');

featuresBtn.addEventListener('mouseenter', () => {
  featureArrow.style.transform = 'rotate(180deg)';
});
featuresBtn.addEventListener('mouseleave', () => {
  featureArrow.style.transform = 'rotate(0deg)';
});


// Card Animation 
const featuresSection = document.querySelector('#features');
const featureCards = document.querySelectorAll('.feature-card');

let hoverTimeout;
let isVisible = false;
let isMobile = window.matchMedia('(max-width: 768px)').matches;

// Listen for screen size changes
window.matchMedia('(max-width: 768px)').addEventListener('change', (e) => {
  isMobile = e.matches;
  
  // Clean up when switching modes
  if (isMobile) {
    // Remove hover listeners when switching to mobile
    removeHoverListeners();
    addClickListener();
  } else {
    // Remove click listener when switching to desktop
    removeClickListener();
    addHoverListeners();
    // Reset mobile state
    if (isVisible) {
      hideFeatures();
      isVisible = false;
    }
  }
});

// Initialize based on current screen size
if (isMobile) {
  addClickListener();
} else {
  addHoverListeners();
}

// Hover functionality (Desktop)
function addHoverListeners() {
  featuresBtn.addEventListener('mouseenter', handleMouseEnter);
  featuresBtn.addEventListener('mouseleave', handleMouseLeave);
  featuresSection.addEventListener('mouseenter', handleSectionMouseEnter);
  featuresSection.addEventListener('mouseleave', handleSectionMouseLeave);
}

function removeHoverListeners() {
  featuresBtn.removeEventListener('mouseenter', handleMouseEnter);
  featuresBtn.removeEventListener('mouseleave', handleMouseLeave);
  featuresSection.removeEventListener('mouseenter', handleSectionMouseEnter);
  featuresSection.removeEventListener('mouseleave', handleSectionMouseLeave);
}

function handleMouseEnter() {
  clearTimeout(hoverTimeout);
  showFeatures();
}

function handleMouseLeave() {
  hoverTimeout = setTimeout(() => {
    if (!featuresSection.matches(':hover')) {
      hideFeatures();
    }
  }, 300);
}

function handleSectionMouseEnter() {
  clearTimeout(hoverTimeout);
}

function handleSectionMouseLeave() {
  hoverTimeout = setTimeout(() => {
    hideFeatures();
  }, 300);
}

// Click functionality (Mobile)
function addClickListener() {
  featuresBtn.addEventListener('click', handleClick);
  document.addEventListener('click', handleOutsideClick);
}

function removeClickListener() {
  featuresBtn.removeEventListener('click', handleClick);
  document.removeEventListener('click', handleOutsideClick);
}

function handleClick(e) {
  e.stopPropagation();
  if (isVisible) {
    hideFeatures();
    featureArrow.style.transform = 'rotate(0deg)';
    featuresBtn.classList.remove('hover:bg-white/10')
  } else {
    showFeatures();
    featureArrow.style.transform = 'rotate(180deg)';
    featuresBtn.classList.add('hover:bg-white/10')
  }
  isVisible = !isVisible;
}

function handleOutsideClick(event) {
  if (!featuresBtn.contains(event.target) && !featuresSection.contains(event.target)) {
    if (isVisible) {
      hideFeatures();
      isVisible = false;
    }
  }
}

// Animation functions (same for both modes)
function showFeatures() {
  featuresSection.classList.add('visible');
  
  setTimeout(() => {
    featureCards.forEach(card => {
      card.classList.add('animate');
    });
  }, 200);
}

function hideFeatures() {
  featureCards.forEach(card => {
    card.classList.remove('animate');
  });
  
  setTimeout(() => {
    featuresSection.classList.remove('visible');
  }, 100);
}