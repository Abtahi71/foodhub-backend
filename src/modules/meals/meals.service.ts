//import { integer } from './../../../node_modules/effect/src/Config';
//import { string } from "better-auth"

import { prisma } from "../../lib/prisma";

//import { get } from 'http';
//import { Prisma } from '@prisma/client';


const getAllMeals = async ({
  search,
  name,
  description,
  isAvailable,
  category,
  reviews,
  ratings,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  name: string | undefined;
  description: string | undefined;
  isAvailable:boolean | undefined;
  category: string | undefined;
  reviews: string | undefined;
  ratings: number | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
    const andConditions:any[]=[]

    if(search){
        andConditions.push({
            OR:[
                {meal:{name:{contains:search,mode:'insensitive'}}},
                {meal:{description:{contains:search,mode:'insensitive'}}},
                {provider:{restaurantName:{contains:search,mode:'insensitive'}}}
            ]
        })
    }
    
    console.log("Search condition:", search);
    if (typeof ratings === "number" && !isNaN(ratings)) {
      andConditions.push({
            provider: {
              reviews: {
                some: {
                  rating: {
                    gte: ratings,
                  },
                },
              },
            },
      });
    }


    if(category){
        andConditions.push({meal:{category:{name:{equals:category,mode:'insensitive'}}}})
    }

    if(typeof isAvailable==='boolean'){
        andConditions.push({isAvailable})
    }
   
    console.log(
      "Final WHERE conditions:",
      JSON.stringify(andConditions, null, 2)
    );
  const result = await prisma.providerMeal.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions,
    },
    orderBy:
      sortBy === "createdAt"
        ? { meal: { createdAt: sortOrder as 'asc'|'desc' } } // createdAt is in Meal model
        : sortBy === "price"
        ? { price: sortOrder as 'asc' | 'desc' } // price is directly in ProviderMeal model
        : { [sortBy]: sortOrder as 'asc' | 'desc' }, // For other fields like 'name' which are in Meal model
    select: {
      id: true,
      price: true,
      isAvailable: true,
      meal: {
        select: {
          name: true,
          description: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
      provider: {
        select: {
          id: true,
          restaurantName: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.providerMeal.count({
    where: {
      AND: andConditions,
    },

  })
  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getMealById = async (id: string) => {
    const meal = await prisma.meal.findUnique({
        where: { id },
        include: {
        category: true,
        provider: {
            where: { isAvailable: true },
            select: {
            price: true,
            provider: {
                select: {
                restaurantName: true,
                reviews:{
                  select:{rating:true,}
                }
                },
            },
            },
        },
        },
    });
    return meal;
}


const getProviders = async()=>{
    const providers = await prisma.provider.findMany({
        select:{
            id:true,
            restaurantName:true,
            isOpen:true,
            description:true,
            createdAt:true,
            image:true
        },   
    })
    return providers
}

const getProviderById = async (
  providerId: string,
  categoryName?: string 
) => {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },

    select: {
      id: true,
      restaurantName: true,
      description: true,
      isOpen: true,
      image:true,
      cuisineType:true,
      reviews:{
        select:{
          id:true,
          rating:true,
          comment:true,
          user:{
            select:{
              name:true
            }
          }
        }
      },

      meals: {
        where: {
          isAvailable: true, 
          ...(categoryName && {
            meal: {
              category: {
                name: categoryName,
              },
            },
          }),
        },
        select: {
          id:true,
          price: true,
          meal: {
            select: {
              id: true,
              name: true,
              description: true,
              

              category: {
                select: {
                  id: true,
                  name: true,
                },
              },

             
            },
          },
        },
      },
    },
  });

  if(!provider)return null
  let totalRating = 0

  const reviews = provider.reviews.map((review:any) => {
    review.rating && (totalRating += review.rating)
  })
  const averageRating = provider.reviews.length > 0 ? totalRating / provider.reviews.length : null

 

  return {
    ...provider,averageRating}
};


export const mealService = {getAllMeals,getMealById,getProviders,getProviderById}