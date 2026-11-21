/**
 * RASIBOGA API smoke test.
 *
 *   node tests/smoke.mjs
 *
 * Requires the API to be running (npm run dev). Uses only built-in fetch.
 * Creates and then deletes its own fixtures, so seeded data stays intact.
 */
const BASE = process.env.API_URL || 'http://localhost:5000/api';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, extra = '') {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

let cookie = '';

async function request(method, path, { body, token, form, anon = false } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookie && !anon) headers.Cookie = cookie;
  let payload;

  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  const setCookie = response.headers.getSetCookie?.() || [];
  if (setCookie.length) cookie = setCookie.map((item) => item.split(';')[0]).join('; ');

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }
  return { status: response.status, json };
}

async function main() {
  console.log(`\nRASIBOGA smoke test -> ${BASE}\n`);

  console.log('Public endpoints');
  const health = await request('GET', '/health');
  check('health responds ok', health.status === 200 && health.json?.data?.status === 'ok');

  const foods = await request('GET', '/foods?limit=5');
  check('foods list returns data', foods.status === 200 && Array.isArray(foods.json?.data));
  check('foods list has meta.total', Number.isFinite(foods.json?.meta?.total));
  const seededFood = foods.json?.data?.[0];

  const filtered = await request('GET', '/foods?category=Minuman&limit=50');
  check(
    'category filter only returns Minuman',
    filtered.status === 200 && filtered.json.data.every((item) => item.category === 'Minuman')
  );

  const search = await request('GET', '/foods?search=lontong');
  check('search finds Lontong Tuyuhan', search.json?.data?.some((item) => /lontong/i.test(item.name)));

  const provenance = await request('GET', '/foods?provenance=local&limit=50');
  check(
    'provenance filter works',
    provenance.json?.data?.every((item) => item.provenance.type === 'local')
  );

  const district = await request('GET', '/foods?district=Lasem&limit=50');
  check('district filter works', district.status === 200 && district.json.data.length >= 1);

  const detail = await request('GET', '/foods/lontong-tuyuhan');
  check('food detail by slug', detail.status === 200 && detail.json?.data?.food?.slug === 'lontong-tuyuhan');
  check('food detail includes recipe with steps', (detail.json?.data?.recipe?.steps?.length || 0) > 0);
  check('food detail includes related ingredients', (detail.json?.data?.ingredients?.length || 0) > 0);

  const recipeByFood = await request('GET', `/recipes/food/${detail.json.data.food._id}`);
  check('recipe by food id', recipeByFood.status === 200 && recipeByFood.json?.data?.steps?.length > 0);

  const map = await request('GET', '/locations/map');
  check('map returns food markers', (map.json?.data?.foodMarkers?.length || 0) > 0);
  check('map returns ingredient markers', (map.json?.data?.ingredientMarkers?.length || 0) > 0);
  check(
    'map markers all have numeric coordinates',
    map.json.data.foodMarkers.every(
      (marker) => Number.isFinite(marker.location.coordinates.lat) && Number.isFinite(marker.location.coordinates.lng)
    )
  );

  const categories = await request('GET', '/categories');
  check('categories endpoint', categories.status === 200 && categories.json.data.length === 3);

  const articles = await request('GET', '/articles');
  check('articles list', articles.status === 200 && articles.json.data.length >= 1);
  if (articles.json?.data?.length) {
    const article = await request('GET', `/articles/${articles.json.data[0].slug}`);
    check('article detail by slug', article.status === 200 && Boolean(article.json.data.content));
  }

  console.log('\nAuthorization');
  const unauth = await request('GET', '/admin/stats');
  check('admin stats rejects anonymous', unauth.status === 401);
  const unauthWrite = await request('POST', '/foods', { body: { name: 'Hack', category: 'Minuman' } });
  check('food create rejects anonymous', unauthWrite.status === 401);

  const badLogin = await request('POST', '/auth/login', {
    body: { email: 'admin@rasiboga.local', password: 'wrong-password-123' },
  });
  check('wrong password rejected', badLogin.status === 401);

  const login = await request('POST', '/auth/login', {
    body: {
      email: process.env.ADMIN_EMAIL || 'admin@rasiboga.local',
      password: process.env.ADMIN_PASSWORD || 'GantiSayaSegera123!',
    },
  });
  check('admin login succeeds', login.status === 200);
  const token = login.json?.data?.token;
  check('login does not expose password hash', !JSON.stringify(login.json).includes('$2'));
  check('auth cookie set', Boolean(cookie));

  const me = await request('GET', '/auth/me', { token });
  check('auth/me returns admin', me.status === 200 && me.json?.data?.email);

  const stats = await request('GET', '/admin/stats', { token });
  check('admin stats with token', stats.status === 200 && Number.isFinite(stats.json?.data?.totals?.foods));

  console.log('\nAdmin CRUD');
  const suffix = Date.now().toString(36);
  const slug = `uji-smoke-${suffix}`;

  const created = await request('POST', '/foods', {
    token,
    body: {
      name: `Makanan Uji ${suffix}`,
      slug,
      category: 'Minuman',
      provenance: { type: 'general' },
      description: 'Data uji otomatis.',
      published: false,
    },
  });
  check('create food', created.status === 201 && created.json?.data?.slug === slug);
  const foodId = created.json?.data?._id;

  const draftDetail = await request('GET', `/foods/${slug}`, { anon: true });
  check('draft food hidden from public', draftDetail.status === 404);

  const adminDraft = await request('GET', `/foods/${slug}`, { token });
  check('draft visible to admin', adminDraft.status === 200);

  const updated = await request('PUT', `/foods/${foodId}`, {
    token,
    body: { published: true, description: 'Data uji diperbarui.' },
  });
  check('update food publishes it', updated.status === 200 && updated.json.data.published === true);

  const publishedDetail = await request('GET', `/foods/${slug}`);
  check('published food is public', publishedDetail.status === 200);

  const invalidFood = await request('POST', '/foods', {
    token,
    body: { name: '', category: 'Tidak Ada' },
  });
  check('invalid food rejected', invalidFood.status === 400);

  // Recipe for the test food
  const ingredient = await request('GET', '/ingredients?limit=1');
  const ingredientId = ingredient.json?.data?.[0]?._id;

  const recipe = await request('POST', '/recipes', {
    token,
    body: {
      food: foodId,
      servings: 2,
      preparationTime: 5,
      cookingTime: 10,
      difficulty: 'Mudah',
      ingredients: [{ ingredient: ingredientId, quantity: 1, unit: 'sdt' }],
      equipment: ['Gelas'],
      steps: [{ title: 'Langkah uji', description: 'Aduk hingga rata.', durationSeconds: 60 }],
      notes: 'Uji otomatis.',
      published: true,
    },
  });
  check('create recipe', recipe.status === 201 && recipe.json?.data?.steps?.length === 1);
  check('recipe step numbering normalised', recipe.json?.data?.steps?.[0]?.stepNumber === 1);
  const recipeId = recipe.json?.data?._id;

  const badRecipe = await request('POST', '/recipes', { token, body: { food: foodId, steps: [{ description: '' }] } });
  check('recipe with empty step rejected', badRecipe.status === 400);

  // Ingredient
  const newIngredient = await request('POST', '/ingredients', {
    token,
    body: {
      name: `Bahan Uji ${suffix}`,
      description: 'Bahan uji.',
      gastronomyDescription: '## Narasi uji\nRasa, sejarah, dan cara olah bahan uji.',
    },
  });
  check('create ingredient', newIngredient.status === 201);
  check(
    'gastronomy description persisted',
    newIngredient.json?.data?.gastronomyDescription?.includes('Narasi uji')
  );
  const ingredientNewId = newIngredient.json?.data?._id;

  const dupIngredient = await request('POST', '/ingredients', {
    token,
    body: { name: `Bahan Uji ${suffix}` },
  });
  check('duplicate ingredient rejected', dupIngredient.status === 409);

  // Location
  const location = await request('POST', '/locations', {
    token,
    body: {
      name: `Lokasi Uji ${suffix}`,
      village: 'Uji',
      district: 'Rembang',
      coordinates: { lat: -6.71, lng: 111.34 },
      locationType: ['food-origin'],
      verificationStatus: 'unverified',
    },
  });
  check('create location', location.status === 201);
  const locationId = location.json?.data?._id;

  const badLocation = await request('POST', '/locations', {
    token,
    body: { name: 'Lokasi Salah', coordinates: { lat: 999, lng: 999 } },
  });
  check('invalid coordinates rejected', badLocation.status === 400);

  const ingredientDetail = await request(
    'GET',
    `/ingredients/slug/${newIngredient.json?.data?.slug}`
  );
  check(
    'ingredient slug detail includes gastronomy',
    ingredientDetail.status === 200 &&
      ingredientDetail.json?.data?.gastronomyDescription?.includes('Narasi uji')
  );

  const linkedIngredient = await request('PUT', `/ingredients/${ingredientNewId}`, {
    token,
    body: {
      originLocations: [locationId],
      gastronomyDescription: '## Narasi lengkap\nDitambahkan setelah lokasi tersedia.',
    },
  });
  check(
    'ingredient links a mappable location',
    linkedIngredient.status === 200 &&
      linkedIngredient.json?.data?.originLocations?.[0]?.hasCoordinates === true
  );

  // Video + YouTube validation
  const badVideo = await request('POST', '/videos', {
    token,
    body: { title: 'Video uji', type: 'youtube', url: 'https://evil.example.com/watch?v=abc' },
  });
  check('non-YouTube URL rejected', badVideo.status === 400);

  const goodVideo = await request('POST', '/videos', {
    token,
    body: {
      title: `Video Uji ${suffix}`,
      type: 'youtube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      published: true,
    },
  });
  check('valid YouTube URL accepted', goodVideo.status === 201);
  check(
    'embed URL generated server-side',
    goodVideo.json?.data?.embedUrl === 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  );
  const videoId = goodVideo.json?.data?._id;

  // Article
  const article = await request('POST', '/articles', {
    token,
    body: {
      title: `Artikel Uji ${suffix}`,
      excerpt: 'Uji.',
      content: 'Isi uji.\n\n![Arsip uji](/uploads/arsip.png "Keterangan arsip")',
      published: true,
    },
  });
  check('create article', article.status === 201 && Boolean(article.json?.data?.slug));
  check(
    'article archive image syntax stored verbatim',
    article.json?.data?.content?.includes('![Arsip uji](/uploads/arsip.png "Keterangan arsip")')
  );
  const articleId = article.json?.data?._id;

  // Upload (1x1 PNG)
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  const form = new FormData();
  form.append('file', new Blob([png], { type: 'image/png' }), 'pixel.png');
  form.append('kind', 'image');
  const upload = await request('POST', '/uploads', { token, form });
  check('image upload works', upload.status === 201 && Boolean(upload.json?.data?.url));

  const badForm = new FormData();
  badForm.append('file', new Blob([Buffer.from('not an image')], { type: 'text/plain' }), 'x.txt');
  const badUpload = await request('POST', '/uploads', { token, form: badForm });
  check('non-image upload rejected', badUpload.status === 400);

  // Community submission
  const submission = await request('POST', '/community/submissions', {
    body: {
      type: 'food-suggestion',
      name: 'Penguji',
      email: 'penguji@example.com',
      title: `Saran Uji ${suffix}`,
      description: 'Mohon tambahkan dokumentasi.',
    },
  });
  check('community submission accepted', submission.status === 201 && submission.json?.data?.status === 'pending');
  const submissionId = submission.json?.data?.id;

  const publicList = await request('GET', '/community/submissions', { anon: true });
  check('submissions list requires auth', publicList.status === 401);

  const review = await request('PATCH', `/community/submissions/${submissionId}/status`, {
    token,
    body: { status: 'approved', adminNote: 'Uji otomatis.' },
  });
  check('admin can review submission', review.status === 200 && review.json.data.status === 'approved');

  // Cleanup
  await request('DELETE', `/recipes/${recipeId}`, { token });
  await request('DELETE', `/foods/${foodId}?cascade=true`, { token });
  await request('DELETE', `/ingredients/${ingredientNewId}`, { token });
  await request('DELETE', `/locations/${locationId}?cascade=true`, { token });
  await request('DELETE', `/videos/${videoId}`, { token });
  await request('DELETE', `/articles/${articleId}`, { token });

  const afterDelete = await request('GET', `/foods/${slug}`);
  check('deleted food is gone', afterDelete.status === 404);

  const logout = await request('POST', '/auth/logout', { token });
  check('logout succeeds', logout.status === 200);

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  if (failed) {
    console.log('Failures:');
    failures.forEach((item) => console.log(` - ${item}`));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('\nSmoke test crashed:', error);
  process.exitCode = 1;
});
