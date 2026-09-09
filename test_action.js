const { getAthleteDashboardData } = require('./app/actions/users');

async function test() {
  const result = await getAthleteDashboardData("cmtkeap2s0004o4wo8jtj3m2n");
  console.log("Success:", result.success);
  console.log("Purchases count:", result.purchases ? result.purchases.length : 0);
  console.log("Purchases:", JSON.stringify(result.purchases, null, 2));
}

test().catch(console.error);
