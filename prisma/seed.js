const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Đang tạo dữ liệu mẫu ---');

    // 1. Tạo Categories
    const cat1 = await prisma.category.upsert({
        where: { name: 'Điện thoại' },
        update: {},
        create: {
            name: 'Điện thoại',
            slug: 'dien-thoai',
            description: 'Các dòng smartphone mới nhất',
            image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png'
        },
    });

    const cat2 = await prisma.category.upsert({
        where: { name: 'Laptop' },
        update: {},
        create: {
            name: 'Laptop',
            slug: 'laptop',
            description: 'Máy tính xách tay văn phòng và gaming',
            image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop-macbook-air-m2-1.png'
        },
    });

    const cat3 = await prisma.category.upsert({
        where: { name: 'Phụ kiện' },
        update: {},
        create: {
            name: 'Phụ kiện',
            slug: 'phu-kien',
            description: 'Tai nghe, sạc, ốp lưng',
            image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-bluetooth-apple-airpods-3_1.png'
        },
    });

    console.log('✔ Đã tạo 3 danh mục.');

    // 2. Tạo Products
    const products = [
        {
            title: 'iPhone 15 Pro Max 256GB',
            slug: 'iphone-15-pro-max-256gb',
            price: 29500000,
            description: 'Màn hình 6.7 inch, chip A17 Pro siêu mạnh mẽ.',
            images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png'],
            categoryId: cat1.id
        },
        {
            title: 'Samsung Galaxy S24 Ultra',
            slug: 'samsung-galaxy-s24-ultra',
            price: 26990000,
            description: 'Siêu phẩm AI Phone đầu tiên của Samsung.',
            images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/2/s24-ultra-xam.png'],
            categoryId: cat1.id
        },
        {
            title: 'MacBook Air M2 13 inch',
            slug: 'macbook-air-m2-13-inch',
            price: 24500000,
            description: 'Thiết kế mỏng nhẹ, hiệu năng vượt trội với chip M2.',
            images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop-macbook-air-m2-1.png'],
            categoryId: cat2.id
        },
        {
            title: 'AirPods Pro Gen 2 (USB-C)',
            slug: 'airpods-pro-gen-2-usb-c',
            price: 5890000,
            description: 'Chống ồn chủ động gấp đôi, cổng sạc USB-C mới.',
            images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/a/i/airpods-pro-2-usb-c.png'],
            categoryId: cat3.id
        }
    ];

    for (const p of products) {
        await prisma.product.upsert({
            where: { title: p.title },
            update: {},
            create: p
        });
    }

    console.log('✔ Đã tạo 4 sản phẩm mẫu.');

    // 3. Tạo Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
            name: 'admin',
            description: 'Quản trị viên hệ thống',
        },
    });

    const userRole = await prisma.role.upsert({
        where: { name: 'user' },
        update: {},
        create: {
            name: 'user',
            description: 'Người dùng tiêu chuẩn',
        },
    });

    console.log('✔ Đã tạo 2 roles (admin, user).');

    console.log('--- Hoàn tất ---');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
