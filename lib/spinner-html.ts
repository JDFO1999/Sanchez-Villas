export const iosSpinnerHtml = `
<div style="display: flex; justify-content: center; align-items: center; padding: 20px;">
  <div style="position: relative; width: 48px; height: 48px; animation: spin 1s steps(12, end) infinite;">
    <style>
      @keyframes spin { 100% { transform: rotate(360deg); } }
      .ios-blade {
        position: absolute; left: 46%; top: 0; width: 8%; height: 25%;
        border-radius: 5px; background-color: #22c55e; transform-origin: 50% 200%;
      }
    </style>
    ${Array.from({length: 12}).map((_, i) => 
      `<div class="ios-blade" style="transform: rotate(${i*30}deg); opacity: ${(i+1)/12}"></div>`
    ).join('')}
  </div>
</div>
`;
