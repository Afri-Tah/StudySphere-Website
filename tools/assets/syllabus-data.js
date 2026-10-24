// ══════════════════════════════════════════════════════
//  SYLLABUS MAP — what the exam board says students must learn
// ══════════════════════════════════════════════════════
// Content below is a short, re-worded summary of the official specification, so notes can
// be matched to the real syllabus instead of the AI's guess about it.
//
// Pearson Edexcel International Advanced Subsidiary / Advanced Level in Mathematics
// (XMA01 / YMA01), Specification Issue 3, April 2019 (first teaching Sept 2018):
// https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Mathematics/2018/Specification-and-Sample-Assessment/international-a-level-maths-spec.pdf
//
// To add another subject: add a new entry to SS_SYLLABI with the same shape
// (key = "<curriculum>|<level>|<subject>"); the Notes Generator picks it up automatically.
// Always check new entries against the official specification before publishing.

const SS_SYLLABI = {
  'Edexcel Pearson|A Level / IAL|Mathematics': {
    title: 'Pearson Edexcel International A Level Mathematics (YMA01)',
    short: 'Edexcel IAL Mathematics',
    issue: 'Specification Issue 3, April 2019',
    source: 'https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Mathematics/2018/Specification-and-Sample-Assessment/international-a-level-maths-spec.pdf',
    notOnSpec: [
      'Further Mathematics units only (NOT in IAL Mathematics): hyperbolic and inverse hyperbolic functions, reduction formulae, hyperbolic/trigonometric substitutions, arc length and surface area of revolution (FP3); Maclaurin and Taylor series, polar coordinates, second-order differential equations, integrating-factor method (FP2); complex numbers, matrices, proof by induction (FP1)',
      'Not listed in any unit of this specification: improper integrals, Riemann sums, formal proof of the Fundamental Theorem of Calculus'
    ],
    units: [
      {
        code: 'P1', name: 'Pure Mathematics 1', exam: 'WMA11/01',
        know: ['Quadratic formula $x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$', 'Sine rule, area $=\\frac12ab\\sin C$, arc length $r\\theta$, sector area $\\frac12r^2\\theta$', '$\\frac{d}{dx}x^n=nx^{n-1}$; $\\int x^n\\,dx=\\frac{x^{n+1}}{n+1}+c$ for $n\\ne-1$'],
        sections: [
          { n: '1', name: 'Algebra and functions', pts: [
            ['1.1', 'Laws of indices for all rational exponents; $a^{m/n}$ as a root'],
            ['1.2', 'Use and manipulation of surds, including rationalising denominators'],
            ['1.3', 'Quadratic functions and their graphs'],
            ['1.4', 'The discriminant of a quadratic: $b^2-4ac>0$, $=0$, $<0$'],
            ['1.5', 'Completing the square; solving quadratics by factorising, the formula, a calculator and completing the square'],
            ['1.6', 'Simultaneous equations solved analytically by substitution'],
            ['1.7', 'Interpreting linear and quadratic inequalities graphically (including brackets and fractions reducible to linear/quadratic, e.g. $\\frac{a}{x}<b$ becomes $ax<bx^2$, $x\\ne0$)'],
            ['1.8', 'Representing linear and quadratic inequalities graphically (dotted/solid lines and shading)'],
            ['1.9', 'Solving linear and quadratic inequalities'],
            ['1.10', 'Algebraic manipulation of polynomials: expanding, collecting, factorising (degree up to 3, e.g. $x^3+4x^2+3x$); $f(x)$ notation'],
            ['1.11', 'Graphs and sketching: cubics, reciprocals $y=\\frac kx$ and $y=\\frac k{x^2}$, asymptotes, trigonometric graphs; using intersections to solve equations'],
            ['1.12', 'Effect of $y=af(x)$, $f(x)+a$, $f(x+a)$, $f(ax)$ on graphs of quadratics, cubics, reciprocals, sin, cos, tan']] },
          { n: '2', name: 'Coordinate geometry in the (x, y) plane', pts: [
            ['2.1', 'Equation of a straight line: $y-y_1=m(x-x_1)$ and $ax+by+c=0$; line through two points; line parallel or perpendicular to a given line through a given point'],
            ['2.2', 'Conditions for two lines to be parallel or perpendicular']] },
          { n: '3', name: 'Trigonometry', pts: [
            ['3.1', 'Sine and cosine rules and area $\\frac12ab\\sin C$, including the ambiguous case of the sine rule'],
            ['3.2', 'Radian measure; arc length $s=r\\theta$ and sector area $A=\\frac12r^2\\theta$'],
            ['3.3', 'Sine, cosine and tangent functions: graphs, symmetries, periodicity (e.g. $y=3\\sin x$, $y=\\sin(x+\\frac\\pi6)$, $y=\\sin2x$)']] },
          { n: '4', name: 'Differentiation', pts: [
            ['4.1', 'Derivative as the gradient of the tangent, as a limit and as a rate of change; second-order derivatives (chain rule is NOT required)'],
            ['4.2', 'Differentiating $x^n$ and sums, differences and constant multiples (e.g. $(2x+5)(x-1)$ must be expanded first, and simple quotients rewritten as powers of $x$)'],
            ['4.3', 'Gradients, tangents and normals']] },
          { n: '5', name: 'Integration', pts: [
            ['5.1', 'Indefinite integration as the reverse of differentiation; a constant of integration is required'],
            ['5.2', 'Integrating $x^n$ (excluding $n=-1$) and related sums, differences and multiples; given $f\'(x)$ and a point, find the curve $y=f(x)$']] }
        ]
      },
      {
        code: 'P2', name: 'Pure Mathematics 2', exam: 'WMA12/01',
        know: ['Laws of logarithms: $\\log_a x+\\log_a y=\\log_a(xy)$, $\\log_a x-\\log_a y=\\log_a\\frac xy$, $k\\log_a x=\\log_a x^k$', '$\\sin^2A+\\cos^2A\\equiv1$, $\\tan\\theta\\equiv\\frac{\\sin\\theta}{\\cos\\theta}$', 'Area under a curve $=\\int_a^b y\\,dx$ ($y\\ge0$)'],
        sections: [
          { n: '1', name: 'Proof', pts: [
            ['1.1', 'Structure of mathematical proof: from assumptions through logical steps to a conclusion'],
            ['1.2', 'Proof by exhaustion (trying all the cases)'],
            ['1.3', 'Disproof by counter-example']] },
          { n: '2', name: 'Algebra and functions', pts: [
            ['2.1', 'Algebraic division by $(ax+b)$ or $(ax-b)$; the Factor Theorem and Remainder Theorem; quotient and remainder; factorising cubics such as $x^3+3x^2-4$']] },
          { n: '3', name: 'Coordinate geometry in the (x, y) plane', pts: [
            ['3.1', 'The circle $(x-a)^2+(y-b)^2=r^2$: find centre and radius from the equation and vice versa; circle properties (angle in a semicircle is $90^\\circ$; perpendicular from centre bisects a chord; radius is perpendicular to the tangent)']] },
          { n: '4', name: 'Sequences and series', pts: [
            ['4.1', 'Sequences from an $n$th-term formula or a recurrence $x_{n+1}=f(x_n)$'],
            ['4.2', 'Arithmetic sequences and series: $n$th term, sum of a finite series (proof of the sum formula should be known), sum of the first $n$ natural numbers, $\\Sigma$ notation'],
            ['4.3', 'Increasing, decreasing and periodic sequences'],
            ['4.4', 'Geometric sequences and series: $n$th term, finite sum (proof should be known), sum to infinity when $|r|<1$; using logs to find $n$'],
            ['4.5', 'Binomial expansion of $(a+bx)^n$ for positive integer $n$; notation $n!$, $\\binom nr$, $^nC_r$']] },
          { n: '5', name: 'Exponentials and logarithms', pts: [
            ['5.1', '$y=a^x$ and its graph ($a>0$, $a\\ne1$)'],
            ['5.2', 'Laws of logarithms, including $\\log_a\\frac1x=-\\log_a x$ and $\\log_a a=1$'],
            ['5.3', 'Solving $a^x=b$; change of base may be used']] },
          { n: '6', name: 'Trigonometry', pts: [
            ['6.1', 'Knowledge and use of $\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}$ and $\\sin^2\\theta+\\cos^2\\theta=1$'],
            ['6.2', 'Solving simple trigonometric equations in a given interval (degrees or radians)']] },
          { n: '7', name: 'Differentiation', pts: [
            ['7.1', 'Maxima, minima and stationary points; increasing and decreasing functions; curve sketching; practical optimisation problems']] },
          { n: '8', name: 'Integration', pts: [
            ['8.1', 'Evaluation of definite integrals'],
            ['8.2', 'Definite integral as area under a curve; area of a region bounded by a curve and lines, or by two curves ($\\int x\\,dy$ is not required)'],
            ['8.3', 'Trapezium rule to approximate area (e.g. $\\int_0^1(2x+1)\\,dx$ with four strips); more strips improves accuracy; an error estimate may be required']] }
        ]
      },
      {
        code: 'P3', name: 'Pure Mathematics 3', exam: 'WMA13/01',
        know: ['$\\sec^2A\\equiv1+\\tan^2A$, $\\operatorname{cosec}^2A\\equiv1+\\cot^2A$', '$\\sin2A\\equiv2\\sin A\\cos A$, $\\cos2A\\equiv\\cos^2A-\\sin^2A$, $\\tan2A\\equiv\\frac{2\\tan A}{1-\\tan^2A}$', 'Derivatives of $\\sin kx$, $\\cos kx$, $e^{kx}$, $\\ln x$, $a^x$; product, quotient and chain rules', 'Integrals of $\\cos kx$, $\\sin kx$, $e^{kx}$, $\\frac1x$; $\\int f\'(g(x))g\'(x)\\,dx=f(g(x))+c$'],
        sections: [
          { n: '1', name: 'Algebra and functions', pts: [
            ['1.1', 'Simplifying rational expressions (linear or quadratic denominators): factorising, cancelling, algebraic division'],
            ['1.2', 'Functions: domain and range, composition ($fg$ means do $g$ first), inverse functions and their graphs; $f^{-1}f(x)=ff^{-1}(x)=x$'],
            ['1.3', 'The modulus function: graphs of $y=|ax+b|$, $y=|f(x)|$, $y=f(|x|)$; solving modulus equations and inequalities graphically'],
            ['1.4', 'Combinations of transformations, e.g. $y=2f(3x)$, $y=f(-x)+1$ (the graph of $y=f(ax+b)$ is not required)']] },
          { n: '2', name: 'Trigonometry', pts: [
            ['2.1', 'sec, cosec, cot, arcsin, arccos, arctan: relationships, graphs, restricted domains; degrees and radians'],
            ['2.2', 'Use of $\\sec^2\\theta=1+\\tan^2\\theta$ and $\\operatorname{cosec}^2\\theta=1+\\cot^2\\theta$'],
            ['2.3', 'Double-angle formulae; $\\sin(A\\pm B)$, $\\cos(A\\pm B)$, $\\tan(A\\pm B)$; writing $a\\cos\\theta+b\\sin\\theta$ as $R\\cos(\\theta\\pm\\alpha)$ or $R\\sin(\\theta\\pm\\alpha)$; half angles; solving $a\\cos\\theta+b\\sin\\theta=c$; proving identities (the $t$-formulae are not required)']] },
          { n: '3', name: 'Exponentials and logarithms', pts: [
            ['3.1', 'The function $e^x$ and its graph, including $y=e^{ax+b}+c$'],
            ['3.2', '$\\ln x$ as the inverse of $e^x$; solving $e^{ax+b}=p$ and $\\ln(ax+b)=q$'],
            ['3.3', 'Using logarithmic graphs to estimate parameters in $y=ax^n$ and $y=kb^x$']] },
          { n: '4', name: 'Differentiation', pts: [
            ['4.1', 'Differentiating $e^{kx}$, $\\ln kx$, $\\sin kx$, $\\cos kx$, $\\tan kx$ and their sums and differences'],
            ['4.2', 'Product, quotient and chain rules; differentiating cosec, cot and sec'],
            ['4.3', 'Using $\\frac{dy}{dx}=1\\big/\\frac{dx}{dy}$'],
            ['4.4', 'Exponential growth and decay models; $\\frac{d}{dx}(a^x)=a^x\\ln a$']] },
          { n: '5', name: 'Integration', pts: [
            ['5.1', 'Integrating $e^{kx}$, $\\frac1x$-type terms, $\\sin kx$, $\\cos kx$ and their sums and differences (e.g. $\\sin3x$, $e^{5x}$, $\\frac1{2x}$)'],
            ['5.2', 'Integration by recognition of known derivatives: $\\int\\frac{f\'(x)}{f(x)}dx=\\ln|f(x)|+c$ and $\\int f\'(x)[f(x)]^n dx=\\frac{[f(x)]^{n+1}}{n+1}+c$ (e.g. $\\tan x$, $\\sec^22x$); using trig identities to integrate $\\sin^2x$, $\\tan^2x$, $\\cos^23x$']] },
          { n: '6', name: 'Numerical methods', pts: [
            ['6.1', 'Locating roots of $f(x)=0$ by a change of sign in an interval where $f$ is continuous'],
            ['6.2', 'Approximate solutions by iteration $x_{n+1}=f(x_n)$ (a lead is given)']] }
        ]
      },
      {
        code: 'P4', name: 'Pure Mathematics 4', exam: 'WMA14/01',
        know: ['Scalar product of vectors in component form'],
        sections: [
          { n: '1', name: 'Proof', pts: [['1.1', 'Proof by contradiction, including the irrationality of $\\sqrt2$ and the infinity of primes, and unfamiliar proofs']] },
          { n: '2', name: 'Algebra and functions', pts: [['2.1', 'Partial fractions with denominators such as $(ax+b)(cx+d)(ex+f)$ and $(ax+b)(cx+d)^2$; numerator degree may equal or exceed denominator; applications to integration, differentiation and series (irreducible quadratic factors like $x^2+a$ are not required)']] },
          { n: '3', name: 'Coordinate geometry in the (x, y) plane', pts: [['3.1', 'Parametric equations of curves and converting between cartesian and parametric forms']] },
          { n: '4', name: 'Binomial expansion', pts: [['4.1', 'Binomial series for any rational $n$; expansion of $(ax+b)^n$ valid for $|x|<\\frac ba$; expanding rational functions by partial fractions']] },
          { n: '5', name: 'Differentiation', pts: [
            ['5.1', 'Differentiating simple functions defined implicitly or parametrically; tangents and normals to such curves'],
            ['5.2', 'Forming simple differential equations; connected rates of change']] },
          { n: '6', name: 'Integration', pts: [
            ['6.1', 'Volume of revolution about the x-axis, $\\pi\\int y^2\\,dx$ ($\\pi\\int x^2\\,dy$ is not required), including with parametric equations'],
            ['6.2', 'Integration by substitution and by parts as the reverse of the chain and product rules; a substitution is given in more complicated cases; $\\int\\ln x\\,dx$ is required; parts may be needed more than once (e.g. $\\int x^2e^x dx$, $\\int e^x\\sin x\\,dx$)'],
            ['6.3', 'Integration using partial fractions and other rational expressions (see also P3 5.2)'],
            ['6.4', 'Analytical solution of simple first-order differential equations with separable variables; general and particular solutions'],
            ['6.5', 'Area under a curve given by parametric equations (sketching the curve is not required)']] },
          { n: '7', name: 'Vectors', pts: [
            ['7.1', 'Vectors in two and three dimensions'],
            ['7.2', 'Magnitude of a vector; unit vector in the direction of $\\mathbf a$'],
            ['7.3', 'Vector addition and scalar multiplication and their geometrical meaning'],
            ['7.4', 'Position vectors; $\\vec{AB}=\\mathbf b-\\mathbf a$'],
            ['7.5', 'Distance between two points in 3D'],
            ['7.6', 'Vector equations of lines, $\\mathbf r=\\mathbf a+t\\mathbf b$ and $\\mathbf r=\\mathbf c+t(\\mathbf d-\\mathbf c)$; lines parallel, intersecting or skew'],
            ['7.7', 'Scalar product and the angle between two lines; $\\mathbf a\\cdot\\mathbf b=0$ means perpendicular']] }
        ]
      },
      {
        code: 'M1', name: 'Mechanics 1', exam: 'WME01/01',
        know: ['Momentum $=mv$; impulse $=mv-mu$', 'Constant acceleration: $v=u+at$, $s=ut+\\frac12at^2$, $s=vt-\\frac12at^2$, $v^2=u^2+2as$, $s=\\frac12(u+v)t$'],
        sections: [
          { n: '1', name: 'Mathematical models in mechanics', pts: [['1.1', 'Modelling in mechanics; terms such as particle, lamina, rigid body, rod, inextensible string, smooth/rough surface, light smooth pulley, bead, wire, peg; the assumptions made']] },
          { n: '2', name: 'Vectors in mechanics', pts: [
            ['2.1', 'Magnitude and direction of a vector; resultants; resolving into components; unit vectors $\\mathbf i$ and $\\mathbf j$'],
            ['2.2', 'Vectors for displacement, velocity, acceleration and force in a plane']] },
          { n: '3', name: 'Kinematics of a particle moving in a straight line', pts: [['3.1', 'Motion with constant acceleration; displacement-time, velocity-time, speed-time and acceleration-time graphs']] },
          { n: '4', name: 'Dynamics of a particle moving in a straight line or plane', pts: [
            ['4.1', 'Force; Newton\'s laws of motion'],
            ['4.2', 'Connected particles (including smooth pulleys and pegs), motion under changing forces, motion on smooth or rough inclined planes'],
            ['4.3', 'Momentum and impulse; conservation of momentum for direct collisions of two particles (Newton\'s law of restitution is not required; one-dimensional only)'],
            ['4.4', 'Coefficient of friction: $F=\\mu R$ when moving']] },
          { n: '5', name: 'Statics of a particle', pts: [
            ['5.1', 'Forces as vectors; resolution of forces'],
            ['5.2', 'Equilibrium of a particle under coplanar forces: weight, normal reaction, tension, thrust, friction'],
            ['5.3', 'Friction in equilibrium: $F\\le\\mu R$']] },
          { n: '6', name: 'Moments', pts: [['6.1', 'Moment of a force; equilibrium of a body under coplanar parallel forces']] }
        ]
      },
      {
        code: 'S1', name: 'Statistics 1', exam: 'WST01/01',
        know: ['Mean $\\bar x=\\frac{\\sum x}{n}$ or $\\frac{\\sum fx}{\\sum f}$; standard deviation $=\\sqrt{\\text{variance}}$; $IQR=Q_3-Q_1$', '$P(A\')=1-P(A)$; independence: $P(A\\cap B)=P(A)P(B)$', '$E(aX+b)=aE(X)+b$, $Var(aX+b)=a^2Var(X)$', '$Z=\\frac{X-\\mu}{\\sigma}$ where $X\\sim N(\\mu,\\sigma^2)$'],
        sections: [
          { n: '1', name: 'Mathematical models in probability and statistics', pts: [['1.1', 'Basic ideas of mathematical modelling in probability and statistics']] },
          { n: '2', name: 'Representation and summary of data', pts: [
            ['2.1', 'Histograms, stem-and-leaf diagrams, box plots; comparing distributions (back-to-back stem-and-leaf may be used)'],
            ['2.2', 'Measures of location: mean, median, mode; interpreting them; data may be discrete, continuous, grouped or ungrouped; coding'],
            ['2.3', 'Measures of dispersion: variance, standard deviation, range, interpercentile ranges; simple interpolation'],
            ['2.4', 'Skewness; outliers (any rule for outliers is given in the question)']] },
          { n: '3', name: 'Probability', pts: [
            ['3.1', 'Elementary probability'],
            ['3.2', 'Sample space; exclusive and complementary events; conditional probability; $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$; $P(A\\cap B)=P(A)P(B|A)$'],
            ['3.3', 'Independence of two events'],
            ['3.4', 'Sum and product laws; tree and Venn diagrams; sampling with and without replacement']] },
          { n: '4', name: 'Correlation and regression', pts: [
            ['4.1', 'Scatter diagrams; linear regression by least squares (equation of the line; may be drawn on a scatter diagram)'],
            ['4.2', 'Explanatory and response variables; predictions within the data range and the dangers of extrapolation; linear change of variable'],
            ['4.3', 'Product moment correlation coefficient: use, interpretation, limitations (derivations and significance tests are not required)']] },
          { n: '5', name: 'Discrete random variables', pts: [
            ['5.1', 'The concept of a discrete random variable'],
            ['5.2', 'Probability function $p(x)=P(X=x)$ and cumulative distribution function $F(x_0)=P(X\\le x_0)$'],
            ['5.3', 'Mean and variance of a discrete random variable; $E(X)$, $E(X^2)$, $Var(X)$; $E(aX+b)$ and $Var(aX+b)$'],
            ['5.4', 'The discrete uniform distribution: mean and variance']] },
          { n: '6', name: 'The Normal distribution', pts: [['6.1', 'The Normal distribution: shape, symmetry, mean, variance; using tables of the cumulative distribution function; questions may need simultaneous equations (knowing the pdf and interpolation are not required)']] }
        ]
      },
      {
        code: 'M2', name: 'Mechanics 2', exam: 'WME02/01',
        know: ['Kinetic energy $=\\frac12mv^2$; potential energy $=mgh$'],
        sections: [
          { n: '1', name: 'Kinematics of a particle moving in a straight line or plane', pts: [
            ['1.1', 'Motion in a vertical plane with constant acceleration, e.g. under gravity'],
            ['1.2', 'Simple cases of projectile motion'],
            ['1.3', 'Velocity and acceleration when displacement is a function of time (calculus)'],
            ['1.4', 'Differentiating and integrating a vector with respect to time']] },
          { n: '2', name: 'Centres of mass', pts: [
            ['2.1', 'Centre of mass of a discrete mass distribution in one and two dimensions'],
            ['2.2', 'Centre of mass of uniform plane figures and simple composite figures (integration not required)'],
            ['2.3', 'Equilibrium of a plane lamina (suspended, free to rotate about a horizontal axis, or on an inclined plane)']] },
          { n: '3', name: 'Work and energy', pts: [['3.1', 'Kinetic and potential energy, work and power; the work-energy principle; conservation of mechanical energy']] },
          { n: '4', name: 'Collisions', pts: [
            ['4.1', 'Momentum as a vector; impulse-momentum principle in vector form; conservation of linear momentum'],
            ['4.2', 'Direct impact of elastic particles; Newton\'s law of restitution with $0\\le e\\le1$; loss of energy in impact'],
            ['4.3', 'Successive impacts of up to three particles, or two particles and a smooth plane (no oblique impact)']] },
          { n: '5', name: 'Statics of rigid bodies', pts: [
            ['5.1', 'Moment of a force'],
            ['5.2', 'Equilibrium of rigid bodies under parallel and non-parallel coplanar forces, including ladders and rods against smooth or rough walls and ground']] }
        ]
      },
      {
        code: 'S2', name: 'Statistics 2', exam: 'WST02/01',
        know: ['$P(a<X\\le b)=\\int_a^b f(x)\\,dx$ and $f(x)=\\frac{dF(x)}{dx}$ for a continuous random variable'],
        sections: [
          { n: '1', name: 'The Binomial and Poisson distributions', pts: [
            ['1.1', 'Using the binomial and Poisson distributions to model situations and commenting on how appropriate they are; cumulative probabilities by calculation or tables; additive property of the Poisson distribution'],
            ['1.2', 'Mean and variance of the binomial and Poisson distributions (no derivations)'],
            ['1.3', 'The Poisson distribution as an approximation to the binomial']] },
          { n: '2', name: 'Continuous random variables', pts: [
            ['2.1', 'The concept of a continuous random variable'],
            ['2.2', 'Probability density function $f(x)$ and cumulative distribution function $F(x)$ (simple polynomials, possibly piecewise)'],
            ['2.3', 'Relationship between density and distribution functions'],
            ['2.4', 'Mean and variance of continuous random variables'],
            ['2.5', 'Mode, median and quartiles of continuous random variables']] },
          { n: '3', name: 'Continuous distributions', pts: [
            ['3.1', 'The continuous uniform (rectangular) distribution, including deriving its mean, variance and cumulative distribution function'],
            ['3.2', 'Normal approximation to the binomial and Poisson distributions, with continuity correction']] },
          { n: '4', name: 'Hypothesis tests', pts: [
            ['4.1', 'Population, census and sample; sampling unit and sampling frame; advantages and disadvantages of a census and a sample survey'],
            ['4.2', 'A statistic and its sampling distribution'],
            ['4.3', 'Concept and interpretation of a hypothesis test; null and alternative hypotheses'],
            ['4.4', 'Critical region; test statistic'],
            ['4.5', 'One-tailed and two-tailed tests'],
            ['4.6', 'Hypothesis tests for the parameter $p$ of a binomial distribution and the mean of a Poisson distribution (tables; normal approximation may be used for binomial tests)']] }
        ]
      },
      {
        code: 'D1', name: 'Decision Mathematics 1', exam: 'WDM11/01',
        know: ['The "middle" item of a list of $N$ items is in position $\\frac{N+1}{2}$ if $N$ is odd, $\\frac{N+2}{2}$ if $N$ is even'],
        sections: [
          { n: '1', name: 'Algorithms', pts: [
            ['1.1', 'Algorithms given as a flow chart or text; how to implement them'],
            ['1.2', 'Bin packing, bubble sort, quick sort (pivot is the middle item), binary search']] },
          { n: '2', name: 'Algorithms on graphs', pts: [
            ['2.1', 'Minimum spanning tree: Prim\'s algorithm (including matrix form) and Kruskal\'s algorithm; drawing a network from a matrix and vice versa'],
            ['2.2', 'Dijkstra\'s algorithm for the shortest path']] },
          { n: '3', name: 'Algorithms on graphs II', pts: [
            ['3.1', 'Route inspection (Chinese postman) with up to four odd nodes, by considering pairings (Floyd\'s algorithm not required)'],
            ['3.2', 'Practical and classical Travelling Salesman problems; short cuts to improve an upper bound'],
            ['3.3', 'Upper and lower bounds using minimum spanning tree methods'],
            ['3.4', 'The nearest neighbour algorithm']] },
          { n: '4', name: 'Critical path analysis', pts: [
            ['4.1', 'Modelling a project with an activity network (activity on arc, dummies) from a precedence table'],
            ['4.2', 'Completing the precedence table for a given activity network'],
            ['4.3', 'Finding the critical path; earliest and latest event times; earliest and latest start and finish times'],
            ['4.4', 'Total float; Gantt (cascade) charts; scheduling']] },
          { n: '5', name: 'Linear programming', pts: [
            ['5.1', 'Formulating problems as linear programs'],
            ['5.2', 'Graphical solution of two-variable problems (ruler and vertex methods)'],
            ['5.3', 'Problems where solutions must be integers']] }
        ]
      }
    ]
  }
};

// Looks up the syllabus for a curriculum/level/subject choice (or null).
function ssGetSyllabus(curriculum, level, subject) {
  return SS_SYLLABI[[curriculum, level, subject].join('|')] || null;
}
const _ssSylStem = w => { w = w.replace(/([^s])s$/, '$1'); if (w.length > 6) w = w.replace(/(ation|ion)$/, ''); if (w.length > 5) w = w.replace(/ing$/, ''); return w; };
const _ssSylTok = s => (String(s).toLowerCase().replace(/[$\\{}^_]/g, ' ').match(/[a-z]{3,}/g) || []).map(_ssSylStem);
const _ssSylSame = (a, b) => { if (a === b) return true; let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i >= 5 && i >= Math.min(a.length, b.length) - 1; };

// Finds the syllabus sections that cover a typed topic, optionally limited to one unit.
// A section qualifies when most of the typed words appear in its name or points (so
// "improper integrals" finds nothing, because improper integrals are not on the spec).
// Sections whose NAME contains the words come first ("integration" finds every Integration
// section, one per unit).
function ssSyllabusMatch(syl, topic, unitCode) {
  if (!syl) return [];
  const q = Array.from(new Set(_ssSylTok(topic))).filter(w => !['and', 'the', 'notes', 'topic', 'about', 'with'].includes(w));
  if (!q.length) return [];
  const has = (toks, w) => toks.some(t => _ssSylSame(t, w));
  const found = [];
  syl.units.filter(u => !unitCode || u.code === unitCode).forEach(u => u.sections.forEach(s => {
    const nameT = _ssSylTok(s.name), ptsT = _ssSylTok(s.pts.map(p => p[1]).join(' '));
    const inName = q.filter(w => has(nameT, w)).length;
    const covered = q.filter(w => has(nameT, w) || has(ptsT, w)).length;
    if (covered / q.length >= 0.6 && covered > 0) found.push({ unit: u, section: s, inName, covered, whole: inName === q.length });
  }));
  const pool = found.some(f => f.whole) ? found.filter(f => f.whole)
    : found.sort((a, b) => b.covered - a.covered || b.inName - a.inName).slice(0, 5);
  const order = syl.units.map(u => u.code);
  return pool.sort((a, b) => order.indexOf(a.unit.code) - order.indexOf(b.unit.code) || +a.section.n - +b.section.n);
}
// All section names (for the topic suggestions list).
function ssSyllabusTopicNames(syl, unitCode) {
  const seen = new Set();
  syl.units.filter(u => !unitCode || u.code === unitCode).forEach(u => u.sections.forEach(s => seen.add(s.name)));
  return Array.from(seen);
}

if (typeof module !== 'undefined' && module.exports) module.exports = { SS_SYLLABI, ssGetSyllabus, ssSyllabusMatch, ssSyllabusTopicNames };
