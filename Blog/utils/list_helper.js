const dummy = (blogs) =>{
    if(blogs)
    return 1
    return 0
}

const totalLikes = (blogs) =>{
    return blogs.length === 0 ? 0 
    : blogs.reduce((sum,blog) => {
        return sum+blog.likes
    },0)
}

const favouriteBlog = (blogs) => {
    if(blogs.length===0)
    return {}
    const mostLikes= blogs.reduce((max,b) => b.likes>max ? b.likes: max, blogs[0].likes )
    const favouriteBlogg=blogs.filter(b => b.likes===mostLikes)
    return favouriteBlogg
}
module.exports = {
    dummy,
    totalLikes,
    favouriteBlog
}