<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			const settings = uni.getStorageSync("settings_key")
			console.log(settings)
			if (!settings) {
				this.globalData.settings = {
					defaultScoreQuery: true,
					useVPN: false,
					maxScore: true,
					scoreQuerySemester: "全部",
					beginTime: new Date().getTime()
				}
			} else {
				this.globalData.settings = settings
			}
			const course = uni.getStorageSync("course_key")
			console.log(course)
			if (course) {
				this.globalData.course = course
			} else {
				this.globalData.course = {
					studentInfo: {
						name: "",
						number: ""
					},
					remark: "",
					course: [],
					years: [],
				}
			}
			const score = uni.getStorageSync("score_key")
			console.log(score)
			if (score) {
				this.globalData.score = score
			}
			// uni.getSystemInfo({
			// 	success(res) {
			// 		console.log(res)
			// 		let brand=res.brand
			// 		let platform="qq小程序"
			// 		let model=res.model
					
			// 	}
			// })
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		globalData: {
			// "host": "https://mdreamfever.com:9009",
			host: "https://mdreamfever.com:9008",
			settings: {},
			course: [],
			score: [],
		}
	}
</script>

<style>
	.message {
		text-align: center;
		padding: 20rpx;
		font-size: .8em;
		color: #ff0000;
		background-color: #ffffff;
	}

	.copy-right {
		position: fixed;
		bottom: 0;
		font-size: .8em;
		margin: 40rpx;
		text-align: center;
	}
</style>
