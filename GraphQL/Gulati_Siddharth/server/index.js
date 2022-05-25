const { ApolloServer, gql } = require("apollo-server");
const axios = require("axios");
const uuid = require("uuid");
const redis = require("redis");
const bluebird = require("bluebird");
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
// handle redis connection temporarily going down without app crashing
client.on("error", function (err) {
  console.error("Error connecting to redis", err);
  process.exit();
});

//Create the type definitions for the query and our data
const typeDefs = gql`
  type Query {
    unsplashImages(pageNum: Int): [ImagePost]
    binnedImages: [ImagePost]
    userPostedImages: [ImagePost]
    getTopTenBinnedPosts: [ImagePost]
  }
  type ImagePost {
    id: ID!
    url: String!
    posterName: String!
    description: String
    userPosted: Boolean!
    binned: Boolean!
    numBinned: Int!
  }

  type Mutation {
    uploadImage(
      url: String!
      description: String
      posterName: String
    ): ImagePost
    updateImage(
      id: ID!
      url: String
      posterName: String
      description: String
      userPosted: Boolean
      binned: Boolean
      numBinned: Int
    ): ImagePost
    deleteImage(id: ID!): ImagePost
  }
`;

const resolvers = {
  Query: {
    unsplashImages: async (_, args) => {
      try {
        const { data } = await axios.get(
          `https://api.unsplash.com/photos/?client_id=ZL3B5MVMCjg6CG1eO8Bzvo4AFW2pZnP3_NpxmVGaopI&page=${args.pageNum}`
        );
        const imageList = [];
        for (let i = 0; i < data.length; i += 1) {
          const cache = await client.getAsync(data[i].id);
          let binned = false;
          if (cache) {
            binned = true;
          }
          let image = {
            id: data[i].id,
            url: data[i].urls.regular,
            posterName: data[i].user.name,
            description: data[i].description,
            userPosted: false,
            binned: binned,
            numBinned: data[i].likes,
          };
          imageList.push(image);
        }
        return imageList;
      } catch (error) {
        throw Error(error.message);
      }
    },

    binnedImages: async () => {
      try {
        let binnedData = await client
          .lrangeAsync("binned", 0, -1)
          .map(JSON.parse)
          .filter((value) => value.binned === true);
        return binnedData;
      } catch (error) {
        throw Error(error.message);
      }
    },

    userPostedImages: async () => {
      try {
        let userData = await client
          .lrangeAsync("userPosted", 0, -1)
          .map(JSON.parse)
          .filter((value) => value.userPosted === true);
        return userData;
      } catch (error) {
        throw Error(error.message);
      }
    },

    getTopTenBinnedPosts: async () => {
      try {
        let numBinnedData = await client
          .zrevrangebyscoreAsync("num", "+inf", "-inf")
          .map(JSON.parse);
        if (numBinnedData) {
          return numBinnedData.slice(0, 10);
        }
        return numBinnedData;
      } catch (error) {
        console.log(error.message);
      }
    },
  },

  Mutation: {
    uploadImage: async (_, args) => {
      try {
        if (!args.url) {
          throw Error("Please Provide URL");
        }
        const userImage = {
          id: uuid.v4(),
          url: args.url,
          description: args.description,
          posterName: args.posterName,
          binned: false,
          userPosted: true,
          numBinned: 0,
        };
        await client.setAsync(userImage.id, JSON.stringify(userImage));
        await client.lpushAsync("userPosted", JSON.stringify(userImage));
        return userImage;
      } catch (error) {
        throw Error(error.message);
      }
    },
    updateImage: async (_, args) => {
      try {
        const userImage = {
          id: args.id,
          url: args.url,
          description: args.description,
          posterName: args.posterName,
          binned: args.binned,
          userPosted: args.userPosted,
          numBinned: args.numBinned,
        };
        const userImageStringify = JSON.stringify(userImage);
        const cache = JSON.parse(await client.getAsync(args.id));
        // when binned is updated
        if (args.binned === true) {
          await client.lremAsync("binned", 0, JSON.stringify(cache));
          await client.lpushAsync("binned", 0, userImageStringify);
          await client.setAsync(args.id, userImageStringify);
          await client.zaddAsync("num", args.numBinned, userImageStringify);
        } else {
          await client.lremAsync("binned", 0, JSON.stringify(cache));
          await client.delAsync(args.id);
          await client.zremAsync("num", JSON.stringify(cache));
        }
        // when userPosted is updated
        if (args.userPosted === true) {
          await client.lremAsync("userPosted", 0, JSON.stringify(cache));
          await client.lpushAsync("userPosted", 0, userImageStringify);
          await client.setAsync(args.id, userImageStringify);
        } else {
          await client.lremAsync("userPosted", 0, JSON.stringify(cache));
        }
        return userImage;
      } catch (error) {
        throw Error(error.message);
      }
    },
    deleteImage: async (_, args) => {
      try {
        let image = JSON.parse(await client.getAsync(args.id));
        await client.lremAsync("userPosted", 0, JSON.stringify(image));
        await client.lremAsync("binned", 0, JSON.stringify(image));
        await client.delAsync(args.id);
        await client.zremAsync("num", JSON.stringify(image));
        return image;
      } catch (error) {
        throw Error(error.message);
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url} 🚀`);
});
