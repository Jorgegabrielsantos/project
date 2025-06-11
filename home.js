(() => {
    const sportSelect = document.getElementById('sport-select');
    const stepQuestions = document.getElementById('step-questions');
    const questionsContainer = document.getElementById('questions-container');
    const abilitiesForm = document.getElementById('abilities-form');
    const stepResult = document.getElementById('step-result');
    const resultSportName = document.getElementById('result-sport-name');
    const restartButton = document.getElementById('restart-button');

    // Define sport abilities (5 abilities to match the pentagon)
    const sportsData = {
      soccer: {
        name: "Soccer",
        abilities: [
          "Passing",
          "Shooting",
          "Dribbling",
          "Defense",
          "Stamina"
        ]
      },
      basketball: {
        name: "Basketball",
        abilities: [
          "Shooting",
          "Ball Handling",
          "Defense",
          "Passing",
          "Athleticism"
        ]
      },
      tennis: {
        name: "Tennis",
        abilities: [
          "Serve",
          "Forehand",
          "Backhand",
          "Volleys",
          "Footwork"
        ]
      }
    };

    // Current sport choice
    let currentSport = null;

    // Event: When sport selected
    sportSelect.addEventListener('change', () => {
      currentSport = sportSelect.value;
      if (!currentSport || !sportsData[currentSport]) {
        stepQuestions.hidden = true;
        stepResult.hidden = true;
        return;
      }
      buildQuestionsForm(currentSport);
      stepQuestions.hidden = false;
      stepResult.hidden = true;
      // Scroll smoothly to questions
      stepQuestions.scrollIntoView({behavior: 'smooth'});
    });

    function buildQuestionsForm(sportKey) {
      questionsContainer.innerHTML = '';
      const abilities = sportsData[sportKey].abilities;
      abilities.forEach((ability, i) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.setAttribute('role','listitem');

        const label = document.createElement('label');
        label.htmlFor = `ability-${i}`;
        label.textContent = ability;

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 10;
        slider.value = 5;
        slider.id = `ability-${i}`;
        slider.name = ability;
        slider.setAttribute('aria-valuemin', 0);
        slider.setAttribute('aria-valuemax', 10);
        slider.setAttribute('aria-valuenow', 5);
        slider.setAttribute('role', 'slider');
        slider.setAttribute('aria-label', ability + ' skill level from 0 to 10');
        slider.addEventListener('input', () => {
          sliderValue.textContent = slider.value;
          slider.setAttribute('aria-valuenow', slider.value);
        });

        const sliderValue = document.createElement('div');
        sliderValue.className = 'slider-value';
        sliderValue.textContent = slider.value;

        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(sliderValue);

        questionDiv.appendChild(label);
        questionDiv.appendChild(sliderContainer);
        questionsContainer.appendChild(questionDiv);
      });
    }

    abilitiesForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!currentSport) return;
      // Gather answers
      const formData = new FormData(abilitiesForm);
      const values = sportsData[currentSport].abilities.map(ability => {
        const val = Number(formData.get(ability));
        return isNaN(val) ? 0 : val;
      });
      showResult(currentSport, values);
      // Scroll to results
      stepResult.hidden = false;
      stepResult.scrollIntoView({behavior: 'smooth'});
    });

    restartButton.addEventListener('click', () => {
      // Reset form and steps
      sportSelect.value = "";
      stepQuestions.hidden = true;
      stepResult.hidden = true;
      currentSport = null;
      questionsContainer.innerHTML = '';
      // Scroll top
      window.scrollTo({top:0, behavior:'smooth'});
      sportSelect.focus();
    });

    // Radar chart drawing configs
    const svg = document.getElementById('radar-svg');
    const gridLayer = document.getElementById('grid-layer');
    const axesLayer = document.getElementById('axes-layer');
    const skillPolygon = document.getElementById('skill-polygon');
    const pointsLayer = document.getElementById('points-layer');
    const labelsLayer = document.getElementById('labels-layer');

    // Pentagon vertices angles offset (-90deg to make top vertex vertical)
    const ANGLE_OFFSET = -90;
    const RADIUS = 140;
    const CENTER = 180; // half of 360 viewbox

    // Draw grid pentagon levels and axes once
    function drawGridAndAxes(labels) {
      gridLayer.innerHTML = '';
      axesLayer.innerHTML = '';
      labelsLayer.innerHTML = '';
      pointsLayer.innerHTML = '';

      // Draw 5 concentric pentagons (levels: 2,4,6,8,10 mapped)
      const levels = 5;
      for(let level=1; level<=levels; level++) {
        let points = [];
        let r = (RADIUS / levels) * level;
        for(let i=0; i<5; i++) {
          let angle_deg = 72 * i + ANGLE_OFFSET;
          let angle_rad = (angle_deg * Math.PI) / 180;
          let x = CENTER + r * Math.cos(angle_rad);
          let y = CENTER + r * Math.sin(angle_rad);
          points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
        }
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', points.join(' '));
        polygon.setAttribute('stroke', '#cbd5e1');
        polygon.setAttribute('stroke-width', '1');
        polygon.setAttribute('fill', 'none');
        gridLayer.appendChild(polygon);
        // Add numeric labels for level (2,4,6,8,10)
        if(level === levels){
          // Skip label at outermost
          continue;
        }
        const labelValue = level * 2;
        // Place label near top vertex line (first vertex)
        let labelX = CENTER + (r + 16) * Math.cos((ANGLE_OFFSET * Math.PI) / 180);
        let labelY = CENTER + (r + 16) * Math.sin((ANGLE_OFFSET * Math.PI) / 180);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.textContent = labelValue.toString();
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('fill', '#94a3b8');
        text.setAttribute('font-size', '12');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        gridLayer.appendChild(text);
      }
      // Draw axes lines and labels
      for(let i=0; i<5; i++){
        const angle_deg = 72 * i + ANGLE_OFFSET;
        const angle_rad = (angle_deg * Math.PI) / 180;
        const x = CENTER + RADIUS * Math.cos(angle_rad);
        const y = CENTER + RADIUS * Math.sin(angle_rad);

        // axis line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', CENTER);
        line.setAttribute('y1', CENTER);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#e0e7ff');
        line.setAttribute('stroke-width', '1.5');
        axesLayer.appendChild(line);

        // label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', CENTER + (RADIUS + 30) * Math.cos(angle_rad));
        label.setAttribute('y', CENTER + (RADIUS + 30) * Math.sin(angle_rad));
        label.setAttribute('fill', '#64748b');
        label.setAttribute('font-weight', '600');
        label.setAttribute('font-size', '14');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'middle');
        label.textContent = labels[i];
        labelsLayer.appendChild(label);
      }
    }

    // Animate polygon drawing with requestAnimationFrame
    function animatePolygon(targetPoints) {
      let progress = 0;
      const duration = 600; // ms
      const startPoints = Array(5).fill([CENTER, CENTER]);
      
      function lerp(a, b, t) {
        return a + (b - a) * t;
      }
      function frame(timestamp){
        if(!animatePolygon.startTime) {
          animatePolygon.startTime = timestamp;
        }
        const elapsed = timestamp - animatePolygon.startTime;
        progress = Math.min(elapsed / duration, 1);
        const interpolatedPoints = targetPoints.map(([x,y], i) => {
          const sx = startPoints[i][0], sy = startPoints[i][1];
          return [lerp(sx, x, progress), lerp(sy, y, progress)];
        });
        skillPolygon.setAttribute('points', interpolatedPoints.map(p=>p.join(',')).join(' '));
        // Draw points
        pointsLayer.innerHTML = '';
        interpolatedPoints.forEach(p=>{
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', p[0]);
          circle.setAttribute('cy', p[1]);
          circle.setAttribute('r', 6);
          circle.setAttribute('fill', 'var(--color-accent)');
          circle.setAttribute('stroke', '#e0e7ff');
          circle.setAttribute('stroke-width', '2');
          pointsLayer.appendChild(circle);
        });
        if(progress < 1) {
          requestAnimationFrame(frame);
        } else {
          animatePolygon.startTime = null;
        }
      }
      requestAnimationFrame(frame);
    }

    // Show the radar chart result
    function showResult(sportKey, values) {
      if(!sportsData[sportKey]) return;
      const labels = sportsData[sportKey].abilities;
      resultSportName.textContent = sportsData[sportKey].name;
      drawGridAndAxes(labels);

      // Convert skill values (0-10) to positions
      // Map 0-10 to 0-RADIUS with max radius = 140
      let points = values.map((val, i) => {
        const angle_deg = 72 * i + ANGLE_OFFSET;
        const angle_rad = (angle_deg * Math.PI) / 180;
        const r = (val / 10) * RADIUS;
        return [CENTER + r * Math.cos(angle_rad), CENTER + r * Math.sin(angle_rad)];
      });
      animatePolygon(points);
    }

  })();